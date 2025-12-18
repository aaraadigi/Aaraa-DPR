
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Clock, ArrowRight, Package, Plus, Truck, CheckCircle2, Upload, X, FileText } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { IndentStatusTracker } from './IndentStatusTracker';
import { Project, ProjectTask, MaterialRequest, DPRRecord } from '../types';
import { MaterialRequestForm } from './MaterialRequestForm';
import { DPREntryForm } from './DPREntryForm';

interface SEDashboardProps {
  projects: Project[];
  tasks: ProjectTask[];
  requests?: MaterialRequest[]; 
  onUpdateTask: (taskId: string, status: ProjectTask['status'], notes?: string) => void;
  onUpdateProjectProgress: (projectId: string, progress: number) => void;
  onSaveMaterialRequest?: (req: MaterialRequest) => void;
  onUpdateIndentStatus?: (id: string, status: string, payload?: any) => void;
  onSaveDPR: (data: DPRRecord) => void;
}

export const SEDashboard: React.FC<SEDashboardProps> = ({ 
  projects, tasks, requests = [], onUpdateTask, onUpdateProjectProgress, onSaveMaterialRequest, onUpdateIndentStatus, onSaveDPR
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'indents' | 'dpr'>('tasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showIndentForm, setShowIndentForm] = useState(false);
  
  // Step 9 GRN + Bill state
  const [grnNote, setGrnNote] = useState('');
  const [billPhoto, setBillPhoto] = useState<string | null>(null);
  const [grnPhoto, setGrnPhoto] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { if (projects.length === 1) setSelectedProjectId(projects[0].id); }, [projects]);

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectRequests = requests.filter(r => r.projectName === currentProject?.name);

  const handleGRNSubmit = (id: string) => {
    if (!grnPhoto || !billPhoto || !grnNote) return alert("Complete all inputs: 1. Invoice No, 2. Signed GRN Photo, 3. Original Vendor Bill Photo.");
    onUpdateIndentStatus?.(id, 'Completed', {
      grnDetails: grnNote,
      grnPhotos: [grnPhoto],
      vendorBillPhoto: billPhoto
    });
    setProcessingId(null);
  };

  const handleCapture = (type: 'grn' | 'bill', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'grn') setGrnPhoto(reader.result as string);
        else setBillPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!selectedProjectId) return <div className="p-10 text-center">Select Site...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <div className="flex space-x-2 bg-white/50 p-1 rounded-xl w-fit mb-6">
        <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'tasks' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>My Tasks</button>
        <button onClick={() => setActiveTab('indents')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'indents' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Material Indents</button>
        <button onClick={() => setActiveTab('dpr')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'dpr' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Daily Report</button>
      </div>

      {activeTab === 'indents' && (
        <div className="space-y-6">
           <div className="flex justify-end"><button onClick={() => setShowIndentForm(true)} className="bg-aaraa-blue text-white px-5 py-2 rounded-xl font-bold">+ New Indent</button></div>
           {projectRequests.map(req => (
             <GlassCard key={req.id}>
                <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                   <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-100 uppercase tracking-widest">{req.status.replace(/_/g, ' ')}</span>
                </div>
                
                <IndentStatusTracker status={req.status} />

                <div className="bg-slate-50 p-3 rounded-lg text-xs my-4">
                  {req.items.map((it, i) => <div key={i} className="flex justify-between border-b py-1 last:border-0"><span>{it.material}</span><span className="font-bold">{it.quantity}</span></div>)}
                </div>

                {req.status === 'GRN_Pending' && (
                  <div className="mt-4 border-t pt-4 space-y-4">
                     <h5 className="font-bold text-sm text-blue-600">Material Arrived? Complete GRN</h5>
                     <input type="text" placeholder="Invoice / DC Number" value={grnNote} onChange={(e) => setGrnNote(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm" />
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400">1. Signed GRN Photo</label>
                           <label className={`w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden ${grnPhoto ? 'border-green-500' : 'border-slate-300'}`}>
                              {grnPhoto ? <img src={grnPhoto} className="w-full h-full object-cover" /> : <Upload size={24} className="text-slate-300"/>}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCapture('grn', e)} />
                           </label>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400">2. Original Bill Photo</label>
                           <label className={`w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden ${billPhoto ? 'border-green-500' : 'border-slate-300'}`}>
                              {billPhoto ? <img src={billPhoto} className="w-full h-full object-cover" /> : <Upload size={24} className="text-slate-300"/>}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCapture('bill', e)} />
                           </label>
                        </div>
                     </div>
                     <button onClick={() => handleGRNSubmit(req.id)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Complete Material Request</button>
                  </div>
                )}
             </GlassCard>
           ))}
        </div>
      )}
      
      {showIndentForm && <div className="fixed inset-0 z-50 bg-slate-50 p-4"><MaterialRequestForm projectName={currentProject?.name} onSave={(data) => { onSaveMaterialRequest?.(data); setShowIndentForm(false); }} onCancel={() => setShowIndentForm(false)} /></div>}
    </div>
  );
};

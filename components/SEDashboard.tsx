
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Clock, ArrowRight, Package, Plus, Truck, CheckCircle2, Upload, X, FileText, Camera } from 'lucide-react';
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

  useEffect(() => { if (projects.length === 1) setSelectedProjectId(projects[0].id); }, [projects]);

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectRequests = requests.filter(r => r.projectName === currentProject?.name);

  const handleGRNSubmit = (id: string) => {
    if (!grnPhoto || !billPhoto || !grnNote) {
      alert("Missing Requirements: 1. DC/Invoice No, 2. Signed GRN Photo, 3. Original Vendor Bill Photo.");
      return;
    }
    onUpdateIndentStatus?.(id, 'Completed', {
      grnDetails: grnNote,
      grnPhotos: [grnPhoto],
      vendorBillPhoto: billPhoto
    });
    setGrnNote('');
    setGrnPhoto(null);
    setBillPhoto(null);
    alert("Material Request Completed! Finance and PM have been notified.");
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

  if (!selectedProjectId) return <div className="p-10 text-center text-slate-400">Please select a site to continue.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-fit mb-6 no-scrollbar overflow-x-auto">
        <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>My Tasks</button>
        <button onClick={() => setActiveTab('indents')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'indents' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Material Indents</button>
        <button onClick={() => setActiveTab('dpr')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dpr' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Daily Report</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'indents' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setShowIndentForm(true)} className="bg-aaraa-blue text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center">
                <Plus size={18} className="mr-2" /> New Material Indent
              </button>
            </div>
            {projectRequests.map(req => (
              <GlassCard key={req.id}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Indent #{req.id.slice(-4)}</h4>
                    <p className="text-xs text-slate-500">{new Date(req.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${req.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <IndentStatusTracker status={req.status} />

                <div className="bg-slate-50 p-4 rounded-xl text-sm my-4 border border-slate-100">
                  {req.items.map((it, i) => (
                    <div key={i} className="flex justify-between border-b border-slate-200 py-1.5 last:border-0">
                      <span className="text-slate-600 font-medium">{it.material}</span>
                      <span className="font-bold text-slate-800">{it.quantity} {it.unit}</span>
                    </div>
                  ))}
                </div>

                {req.status === 'GRN_Pending' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 border-t border-slate-100 pt-6 space-y-4">
                    <h5 className="font-bold text-base text-blue-600 flex items-center">
                      <Package size={18} className="mr-2" /> Step 9: Material Receipt & GRN
                    </h5>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice / Delivery Challan No.</label>
                       <input type="text" placeholder="e.g. INV-10234" value={grnNote} onChange={(e) => setGrnNote(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">1. Signed GRN Photo (With Seal)</label>
                        <label className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${grnPhoto ? 'border-green-500 bg-green-50/10' : 'border-slate-300 hover:border-blue-500'}`}>
                          {grnPhoto ? <img src={grnPhoto} className="w-full h-full object-cover" /> : (
                            <div className="text-center">
                              <Camera size={24} className="text-slate-300 mx-auto mb-2" />
                              <span className="text-[10px] text-slate-400 font-bold">CAPTURE GRN</span>
                            </div>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCapture('grn', e)} />
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">2. Original Vendor Bill Photo</label>
                        <label className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${billPhoto ? 'border-green-500 bg-green-50/10' : 'border-slate-300 hover:border-blue-500'}`}>
                          {billPhoto ? <img src={billPhoto} className="w-full h-full object-cover" /> : (
                            <div className="text-center">
                              <FileText size={24} className="text-slate-300 mx-auto mb-2" />
                              <span className="text-[10px] text-slate-400 font-bold">CAPTURE BILL</span>
                            </div>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCapture('bill', e)} />
                        </label>
                      </div>
                    </div>
                    <button onClick={() => handleGRNSubmit(req.id)} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/20 hover:bg-green-700 transition-colors flex items-center justify-center">
                      <CheckCircle2 size={18} className="mr-2" /> Finalize Receipt & Complete Request
                    </button>
                  </motion.div>
                )}
              </GlassCard>
            ))}
          </motion.div>
        ) : (
          /* Render Task and DPR logic ... */
          <div className="text-slate-400">Site data loading...</div>
        )}
      </AnimatePresence>
      
      {showIndentForm && (
        <div className="fixed inset-0 z-50 bg-slate-50/95 backdrop-blur-md p-4 overflow-y-auto">
          <MaterialRequestForm projectName={currentProject?.name} onSave={(data) => { onSaveMaterialRequest?.(data); setShowIndentForm(false); }} onCancel={() => setShowIndentForm(false)} />
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Clock, ArrowRight, Package, Plus, Truck, CheckCircle2, Upload, X, FileText, Camera, MapPin, ChevronRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { IndentStatusTracker } from './IndentStatusTracker';
import { Project, ProjectTask, MaterialRequest, DPRRecord } from '../types';
import { MaterialRequestForm } from './MaterialRequestForm';
import { DPREntryForm } from './DPREntryForm';

interface SEDashboardProps {
  // Added userName to fix TS error when passed from App.tsx
  userName?: string;
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
  // Destructured userName
  userName,
  projects, tasks, requests = [], onUpdateTask, onUpdateProjectProgress, onSaveMaterialRequest, onUpdateIndentStatus, onSaveDPR
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'indents' | 'dpr'>('tasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showIndentForm, setShowIndentForm] = useState(false);
  
  // Step 9 GRN + Bill state
  const [grnNote, setGrnNote] = useState('');
  const [billPhoto, setBillPhoto] = useState<string | null>(null);
  const [grnPhoto, setGrnPhoto] = useState<string | null>(null);

  // Auto-select if there's only one project
  useEffect(() => { 
    if (projects.length === 1) {
      setSelectedProjectId(projects[0].id);
    } 
  }, [projects]);

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

  // State: No Project Selected
  if (!selectedProjectId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Assigned Projects</h2>
          <p className="text-slate-500 mt-2">Select a site to manage daily reports and material requests.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
               <Building2 size={40} className="mx-auto text-slate-300 mb-4" />
               <p className="text-slate-500 font-medium">No projects assigned to you yet.</p>
            </div>
          ) : (
            projects.map(project => (
              <GlassCard 
                key={project.id} 
                onClick={() => setSelectedProjectId(project.id)}
                className="hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 size={24} />
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <MapPin size={14} className="mr-1" />
                  {project.location}
                </div>
                <div className="mt-6">
                   <div className="flex justify-between text-xs font-bold mb-2">
                     <span className="text-slate-400 uppercase">Site Progress</span>
                     <span className="text-blue-600">{project.progress}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
                   </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    );
  }

  // State: Project Selected
  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSelectedProjectId('')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm"
          >
            <X size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{currentProject?.name}</h2>
            <p className="text-sm text-slate-500 font-medium">{currentProject?.location}</p>
          </div>
        </div>

        <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-fit no-scrollbar overflow-x-auto">
          <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>My Tasks</button>
          <button onClick={() => setActiveTab('indents')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'indents' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Material Indents</button>
          <button onClick={() => setActiveTab('dpr')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dpr' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>Daily Report</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'indents' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setShowIndentForm(true)} className="bg-aaraa-blue text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center">
                <Plus size={18} className="mr-2" /> New Material Indent
              </button>
            </div>
            {projectRequests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <Package size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium">No material indents raised for this site.</p>
              </div>
            ) : (
              projectRequests.map(req => (
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
              ))
            )}
          </motion.div>
        ) : activeTab === 'dpr' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DPREntryForm defaultProjectName={currentProject?.name} onSave={onSaveDPR} />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <Clock size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Task list for {currentProject?.name} is currently empty.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showIndentForm && (
        <div className="fixed inset-0 z-50 bg-slate-50/95 backdrop-blur-md p-4 overflow-y-auto">
          <MaterialRequestForm projectName={currentProject?.name} userName={userName} onSave={(data) => { onSaveMaterialRequest?.(data); setShowIndentForm(false); }} onCancel={() => setShowIndentForm(false)} />
        </div>
      )}
    </div>
  );
};
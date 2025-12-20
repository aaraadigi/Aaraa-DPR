
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Clock, ArrowRight, Package, Plus, Truck, 
  CheckCircle2, Upload, X, FileText, Camera, MapPin, 
  ChevronRight, Image as ImageIcon, Activity, Users,
  BarChart3, ShieldAlert, Zap
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { IndentStatusTracker } from './IndentStatusTracker';
import { Project, ProjectTask, MaterialRequest, DPRRecord } from '../types';
import { MaterialRequestForm } from './MaterialRequestForm';
import { DPREntryForm } from './DPREntryForm';
import { SitePhotoUpload } from './SitePhotoUpload';

interface SEDashboardProps {
  userName?: string;
  projects: Project[];
  tasks: ProjectTask[];
  requests?: MaterialRequest[]; 
  dprRecords?: DPRRecord[];
  onUpdateTask: (taskId: string, status: ProjectTask['status'], notes?: string) => void;
  onUpdateProjectProgress: (projectId: string, progress: number) => void;
  onSaveMaterialRequest?: (req: MaterialRequest) => void;
  onUpdateIndentStatus?: (id: string, status: string, payload?: any) => void;
  onSaveDPR: (data: DPRRecord) => void;
}

type TabType = 'overview' | 'tasks' | 'indents' | 'dpr' | 'photos';

export const SEDashboard: React.FC<SEDashboardProps> = ({ 
  userName,
  projects, tasks, requests = [], dprRecords = [], onUpdateTask, onUpdateProjectProgress, onSaveMaterialRequest, onUpdateIndentStatus, onSaveDPR
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showIndentForm, setShowIndentForm] = useState(false);
  
  const [grnNote, setGrnNote] = useState('');
  const [billPhoto, setBillPhoto] = useState<string | null>(null);
  const [grnPhoto, setGrnPhoto] = useState<string | null>(null);

  // CRITICAL: Removed the useEffect auto-selector to ensure user always sees the project list first.

  const currentProject = projects.find(p => p.id === selectedProjectId);
  
  const projectRequests = useMemo(() => 
    requests.filter(r => r.projectName === currentProject?.name)
  , [requests, currentProject]);

  const projectDPRs = useMemo(() => 
    dprRecords.filter(d => d.projectName === currentProject?.name)
  , [dprRecords, currentProject]);

  const latestDPR = projectDPRs[0];
  const totalWorkers = latestDPR ? latestDPR.labour.reduce((acc, curr) => acc + curr.count, 0) : 0;

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

  // 1. Initial Project Selection Screen (The "Launchpad")
  if (!selectedProjectId) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="max-w-4xl mx-auto px-4 py-16"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl"
          >
            <Zap size={12} className="text-amber-400 fill-amber-400" /> Site Engineer Portal
          </motion.div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Welcome, {userName?.split(' ')[0]}</h2>
          <p className="text-slate-500 mt-4 text-lg font-medium max-w-lg mx-auto">Select an assigned project below to access your site reporting dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm">
               <Building2 size={48} className="mx-auto text-slate-200 mb-6" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Active Project Assignments</p>
            </div>
          ) : (
            projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
              >
                <GlassCard 
                  onClick={() => setSelectedProjectId(project.id)}
                  className="group !p-10 hover:border-blue-500 hover:bg-white transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Building2 size={120} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div className="p-5 bg-slate-50 text-slate-900 rounded-[1.5rem] group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                        <Building2 size={32} />
                      </div>
                      <div className="p-3 bg-slate-100 rounded-full text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{project.name}</h3>
                    <div className="flex items-center text-sm text-slate-500 font-bold uppercase tracking-widest">
                      <MapPin size={14} className="mr-2 text-slate-300" />
                      {project.location}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${project.status === 'On Track' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{project.status}</span>
                      </div>
                      <span className="text-blue-600 text-xs font-black uppercase tracking-widest group-hover:underline">Launch Dashboard</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  // 2. The Site Dashboard (Only visible after selection)
  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Dynamic Header with Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center space-x-5">
          <button 
            onClick={() => { setSelectedProjectId(''); setActiveTab('overview'); }}
            className="p-3 hover:bg-slate-200 rounded-2xl transition-colors bg-white shadow-sm border border-slate-100 group"
            title="Switch Project"
          >
            <X size={20} className="text-slate-600 group-hover:rotate-90 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Site Active</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID: {currentProject?.id}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentProject?.name}</h2>
            <p className="text-sm text-slate-500 font-medium flex items-center mt-1">
              <MapPin size={14} className="mr-1 text-slate-300" />
              {currentProject?.location}
            </p>
          </div>
        </div>

        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-2xl w-fit no-scrollbar overflow-x-auto shadow-inner border border-slate-200/50">
          {(['overview', 'tasks', 'indents', 'dpr', 'photos'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            {/* High Level Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="flex flex-col justify-between h-44 bg-gradient-to-br from-white to-blue-50/30">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
                    <BarChart3 size={24} />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Progress</span>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900">{currentProject?.progress}%</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Site Completion Status</p>
                </div>
              </GlassCard>

              <GlassCard className="flex flex-col justify-between h-44">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Attendance</span>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900">{totalWorkers}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Workers on Site (Today)</p>
                </div>
              </GlassCard>

              <GlassCard 
                onClick={() => setActiveTab('indents')}
                className="flex flex-col justify-between h-44 bg-slate-900 !text-white !border-slate-800 cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                    <Package size={24} />
                  </div>
                  <Plus size={20} className="text-white/40 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Raise Indent</h3>
                  <p className="text-sm text-white/50 font-medium mt-1">{projectRequests.length} Total requests raised</p>
                </div>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Activity Feed */}
              <div className="lg:col-span-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" /> Recent Site Updates
                </h3>
                <div className="space-y-4">
                  {projectDPRs.slice(0, 3).map((dpr, idx) => (
                    <GlassCard key={idx} className="!p-5 flex items-center justify-between group hover:border-slate-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Site Report Submitted</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(dpr.timestamp).toLocaleDateString()} • {dpr.labour.length} Worker Categories
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </GlassCard>
                  ))}
                  {projectRequests.slice(0, 2).map((req, idx) => (
                    <GlassCard key={idx} className="!p-5 flex items-center justify-between group hover:border-slate-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Material Indent Raised</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(req.timestamp).toLocaleDateString()} • Status: {req.status.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </GlassCard>
                  ))}
                </div>
              </div>

              {/* Quick Actions / Safety Checklist */}
              <div className="lg:col-span-4 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <ShieldAlert size={20} className="text-amber-500" /> Safety Status
                </h3>
                <GlassCard className="!p-6 border-amber-100 bg-amber-50/30">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded bg-green-500 flex-shrink-0 mt-0.5 flex items-center justify-center text-white">
                        <CheckCircle2 size={12} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Safety equipment verified for all labor categories</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded bg-amber-500 flex-shrink-0 mt-0.5 flex items-center justify-center text-white">
                        <Clock size={12} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Evening tool-box talk scheduled for 4:30 PM</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('dpr')}
                    className="w-full mt-6 bg-white border border-amber-200 text-amber-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-colors"
                  >
                    Update Safety Notes
                  </button>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'indents' ? (
          <motion.div key="indents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setShowIndentForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center">
                <Plus size={18} className="mr-2" /> Raise New Indent
              </button>
            </div>
            {projectRequests.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <Package size={48} className="mx-auto text-slate-100 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active indents found</p>
              </div>
            ) : (
              projectRequests.map(req => (
                <GlassCard key={req.id} className="!p-0 overflow-hidden border-l-4 border-l-blue-500">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-900 text-xl tracking-tight">Indent #{req.id.slice(-4)}</h4>
                          {req.urgency === 'High' && (
                            <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-red-100">Urgent</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          {new Date(req.timestamp).toLocaleDateString()} • {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
                        req.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                       <IndentStatusTracker status={req.status} />
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Requested</h5>
                          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2 shadow-sm">
                            {req.items.map((it, i) => (
                              <div key={i} className="flex justify-between border-b border-slate-50 py-2 last:border-0 last:pb-0">
                                <span className="text-slate-700 font-bold text-sm">{it.material}</span>
                                <span className="font-black text-slate-900 text-sm">{it.quantity} {it.unit}</span>
                              </div>
                            ))}
                          </div>
                       </div>
                       
                       {req.status === 'GRN_Pending' && (
                         <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <Package size={16} /> Ready for Material Receipt
                            </h5>
                            <button 
                              onClick={() => { /* logic to expand GRN section */ }}
                              className="w-full bg-indigo-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                            >
                              Open GRN Panel
                            </button>
                         </div>
                       )}
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </motion.div>
        ) : activeTab === 'dpr' ? (
          <motion.div key="dpr" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DPREntryForm defaultProjectName={currentProject?.name} onSave={onSaveDPR} />
          </motion.div>
        ) : activeTab === 'photos' ? (
          <motion.div key="photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SitePhotoUpload projectId={currentProject?.id || ''} projectCode={currentProject?.id || ''} userId={userName || ''} />
          </motion.div>
        ) : (
          <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <Clock size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium tracking-tight">Task list for {currentProject?.name} is currently empty.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showIndentForm && (
        <div className="fixed inset-0 z-[100] bg-slate-50/95 backdrop-blur-xl p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-12">
            <MaterialRequestForm 
              projectName={currentProject?.name} 
              userName={userName} 
              onSave={(data) => { onSaveMaterialRequest?.(data); setShowIndentForm(false); }} 
              onCancel={() => setShowIndentForm(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

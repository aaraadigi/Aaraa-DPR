
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Clock, ArrowRight, Package, Plus, Truck, 
  CheckCircle2, Upload, X, FileText, Camera, MapPin, 
  ChevronRight, Image as ImageIcon, Activity, Users,
  BarChart3, ShieldAlert, Zap, Calendar, User, Send, MessageSquare
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { IndentStatusTracker } from './IndentStatusTracker';
import { Project, ProjectTask, MaterialRequest, DPRRecord } from '../types';
import { MaterialRequestForm } from './MaterialRequestForm';
import { DPREntryForm } from './DPREntryForm';
import { SitePhotoUpload } from './SitePhotoUpload';

interface SEDashboardProps {
  userName?: string;
  userId: string;
  projects: Project[];
  tasks: ProjectTask[];
  requests?: MaterialRequest[]; 
  dprRecords?: DPRRecord[];
  onUpdateTask: (taskId: string, status: ProjectTask['status'], notes?: string) => void;
  onUpdateProjectProgress: (projectId: string, progress: number) => void;
  onSaveMaterialRequest?: (req: MaterialRequest) => void;
  onUpdateIndentStatus?: (id: string, status: string, payload?: any) => void;
  onSaveDPR: (data: DPRRecord) => void;
  onRespondToTask?: (taskId: string, response: string) => void;
}

type TabType = 'overview' | 'tasks' | 'indents' | 'dpr' | 'photos';

export const SEDashboard: React.FC<SEDashboardProps> = ({ 
  userName,
  userId,
  projects, tasks, requests = [], dprRecords = [], onUpdateTask, onUpdateProjectProgress, onSaveMaterialRequest, onUpdateIndentStatus, onSaveDPR, onRespondToTask
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showIndentForm, setShowIndentForm] = useState(false);
  const [customReplyId, setCustomReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [grnNote, setGrnNote] = useState('');
  const [billPhoto, setBillPhoto] = useState<string | null>(null);
  const [grnPhoto, setGrnPhoto] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === selectedProjectId);
  
  const projectRequests = useMemo(() => 
    requests.filter(r => r.projectName === currentProject?.name)
  , [requests, currentProject]);

  const projectDPRs = useMemo(() => 
    dprRecords.filter(d => d.projectName === currentProject?.name)
  , [dprRecords, currentProject]);

  const latestDPR = projectDPRs[0];
  const totalWorkers = latestDPR ? latestDPR.labour.reduce((acc, curr) => acc + curr.count, 0) : 0;

  const handleTaskResponse = (taskId: string, response: string) => {
    onRespondToTask?.(taskId, response);
    setCustomReplyId(null);
    setReplyText('');
  };

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
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Welcome, {userName?.split(' ')[0]}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg font-medium max-w-lg mx-auto">Select an assigned project below to access your site reporting dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white dark:bg-[#2c2c2e] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5 shadow-sm">
               <Building2 size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-6" />
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
                  className="group !p-10 hover:border-blue-500 hover:bg-white dark:hover:bg-[#2c2c2e] transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Building2 size={120} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div className="p-5 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-[1.5rem] group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                        <Building2 size={32} />
                      </div>
                      <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-2">{project.name}</h3>
                    <div className="flex items-center text-sm text-slate-500 font-bold uppercase tracking-widest">
                      <MapPin size={14} className="mr-2 text-slate-300" />
                      {project.location}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
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

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-slate-100 dark:border-white/5 pb-8">
        <div className="flex items-center space-x-5">
          <button 
            onClick={() => { setSelectedProjectId(''); setActiveTab('overview'); }}
            className="p-3 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-colors bg-white dark:bg-[#2c2c2e] shadow-sm border border-slate-100 dark:border-white/5 group"
            title="Switch Project"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400 group-hover:rotate-90 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">Site Active</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID: {currentProject?.id}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentProject?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center mt-1">
              <MapPin size={14} className="mr-1 text-slate-300" />
              {currentProject?.location}
            </p>
          </div>
        </div>

        <div className="flex space-x-1 bg-slate-200/50 dark:bg-white/5 p-1 rounded-2xl w-fit no-scrollbar overflow-x-auto shadow-inner border border-slate-200/50 dark:border-white/5">
          {(['overview', 'tasks', 'indents', 'dpr', 'photos'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-800'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="flex flex-col justify-between h-44 bg-gradient-to-br from-white to-blue-50/30 dark:from-[#2c2c2e] dark:to-blue-900/10">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                    <BarChart3 size={24} />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Progress</span>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white">{currentProject?.progress}%</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Site Completion Status</p>
                </div>
              </GlassCard>

              <GlassCard className="flex flex-col justify-between h-44">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Attendance</span>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white">{totalWorkers}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Workers on Site (Today)</p>
                </div>
              </GlassCard>

              <GlassCard 
                onClick={() => setActiveTab('indents')}
                className="flex flex-col justify-between h-44 bg-slate-900 dark:bg-indigo-600 !text-white !border-slate-800 dark:!border-indigo-500 cursor-pointer group shadow-xl"
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
              <div className="lg:col-span-8 space-y-6">
                {currentProject?.startDate && (
                  <div className="flex items-center gap-6 p-6 bg-white dark:bg-[#2c2c2e] border dark:border-white/5 rounded-[2rem] shadow-sm">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                      <Calendar size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Project Period</h4>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {new Date(currentProject.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} — {new Date(currentProject.endDate!).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" /> Recent Site Updates
                </h3>
                <div className="space-y-4">
                  {projectDPRs.slice(0, 3).map((dpr, idx) => (
                    <GlassCard key={idx} className="!p-5 flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/20">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">Site Report Submitted</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                            {new Date(dpr.timestamp).toLocaleDateString()} • {dpr.labour.length} Worker Categories
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </GlassCard>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <ShieldAlert size={20} className="text-blue-600" /> Tasks from PM
                  </h3>
                  <span className="animate-pulse bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black px-2 py-0.5 rounded uppercase">Live Feed</span>
                </div>
                
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="py-12 text-center bg-white dark:bg-[#2c2c2e] rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                       <Clock size={32} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No site tasks assigned</p>
                    </div>
                  ) : (
                    tasks.map(t => (
                      <motion.div 
                        key={t.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className={`p-5 rounded-[1.5rem] border-2 shadow-sm transition-all duration-300 ${
                          t.response ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5' : 'bg-white dark:bg-[#2c2c2e] border-blue-100 dark:border-blue-900/30 ring-2 ring-blue-500/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            t.priority === 'High' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                          }`}>{t.priority} Priority</span>
                          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {new Date(t.dueDate!).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{t.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{t.description}</p>
                        
                        {!t.response ? (
                          <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleTaskResponse(t.id, 'Ok Sir')}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                              >
                                Ok Sir
                              </button>
                              <button 
                                onClick={() => handleTaskResponse(t.id, 'Noted Sir')}
                                className="flex-1 bg-slate-900 dark:bg-white/10 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                              >
                                Noted Sir
                              </button>
                            </div>
                            
                            {customReplyId === t.id ? (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Type reply..." 
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="flex-grow bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold dark:text-white outline-none focus:border-blue-500"
                                />
                                <button 
                                  onClick={() => handleTaskResponse(t.id, replyText)}
                                  className="p-2 bg-blue-600 text-white rounded-xl"
                                >
                                  <Send size={16} />
                                </button>
                              </motion.div>
                            ) : (
                              <button 
                                onClick={() => setCustomReplyId(t.id)}
                                className="w-full py-2 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                              >
                                <MessageSquare size={12} /> Custom Reply
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                               <p className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                 <CheckCircle2 size={10} /> Responded
                               </p>
                               <p className="text-xs font-bold text-slate-700 dark:text-slate-300">"{t.response}"</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
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
            {projectRequests.map(req => (
              <GlassCard key={req.id} className="!p-0 overflow-hidden border-l-4 border-l-blue-500">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Indent #{req.id.slice(-4)}</h4>
                    <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <IndentStatusTracker status={req.status} />
                </div>
              </GlassCard>
            ))}
          </motion.div>
        ) : activeTab === 'dpr' ? (
          <motion.div key="dpr" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DPREntryForm defaultProjectName={currentProject?.name} submittedBy={userId} onSave={onSaveDPR} />
          </motion.div>
        ) : activeTab === 'photos' ? (
          <motion.div key="photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SitePhotoUpload projectId={currentProject?.id || ''} projectCode={currentProject?.id || ''} userId={userName || ''} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {showIndentForm && (
        <div className="fixed inset-0 z-[100] bg-slate-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl p-4 overflow-y-auto">
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

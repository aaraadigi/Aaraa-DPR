
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added XCircle to the import list from lucide-react
import { Building2, MapPin, Search, ThumbsUp, ThumbsDown, Edit2, Save, PackageCheck, History, Clock, CheckCircle2, Package, Image as ImageIcon, Calendar, Plus, User, AlertCircle, XCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { IndentStatusTracker } from './IndentStatusTracker';
import { Project, ProjectTask, Notification, MaterialRequest, RequestItem } from '../types';

interface PMDashboardProps {
  projects: Project[];
  tasks: ProjectTask[];
  notifications: Notification[];
  requests: MaterialRequest[];
  onAssignTask: (task: ProjectTask) => void;
  onClearNotification: (id: string) => void;
  onUpdateIndentStatus?: (id: string, status: string, payload?: any) => void;
}

export const PMDashboard: React.FC<PMDashboardProps> = ({ projects, tasks, requests = [], onUpdateIndentStatus, onAssignTask }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'approvals' | 'history'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<RequestItem[]>([]);
  const [pmNote, setPmNote] = useState('');
  
  // Task assignment state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const pendingApprovals = useMemo(() => 
    requests.filter(req => req.status === 'PM_Review' || req.status === 'Raised_By_SE')
  , [requests]);

  const requestHistory = useMemo(() => 
    requests.filter(req => req.status !== 'PM_Review' && req.status !== 'Raised_By_SE')
  , [requests]);

  const handlePMAction = (id: string, action: 'approve' | 'reject') => {
    if (!onUpdateIndentStatus) return;
    const status = action === 'approve' ? 'QS_Analysis' : 'Rejected_By_PM';
    onUpdateIndentStatus(id, status, { 
      items: editingId === id ? editItems : undefined,
      pmComments: pmNote || (action === 'approve' ? 'Approved by PM' : 'Rejected by PM') 
    });
    setEditingId(null);
    setPmNote('');
  };

  const handleCreateTask = () => {
    if (!selectedProjectId || !taskTitle) return;
    const project = projects.find(p => p.id === selectedProjectId);
    onAssignTask({
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: taskDesc,
      status: 'pending',
      projectName: project?.name,
      assignedTo: project?.siteEngineer,
      priority: taskPriority,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString() // Default 2 days
    });
    setShowTaskForm(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex space-x-2 bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('approvals')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Pending ({pendingApprovals.length})
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Tracking
          </button>
          <button onClick={() => setActiveTab('projects')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            My Projects
          </button>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#2c2c2e] border dark:border-white/5 rounded-xl text-sm" />
          </div>
          <button 
            onClick={() => setShowTaskForm(true)}
            className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'approvals' ? (
          <motion.div key="approvals" className="grid grid-cols-1 gap-6">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#2c2c2e] rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                <PackageCheck size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-slate-400">All caught up! No pending indents.</p>
              </div>
            ) : (
              pendingApprovals.map(req => (
                <GlassCard key={req.id} className="border-l-4 border-blue-500">
                  <div className="flex justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold text-lg">{req.items.length}</div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Indent #{req.id.slice(-4)}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase">{req.projectName} • {req.requestedBy}</p>
                      </div>
                    </div>
                    <button onClick={() => { setEditingId(req.id); setEditItems([...req.items]); }} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl mb-6">
                    {editingId === req.id ? (
                      <div className="space-y-2">
                        {editItems.map((it, i) => (
                          <div key={i} className="flex gap-2">
                            <input value={it.material} onChange={e => { const n=[...editItems]; n[i].material=e.target.value; setEditItems(n); }} className="flex-1 bg-white dark:bg-slate-800 border dark:border-white/5 rounded p-1 text-sm font-bold dark:text-white" />
                            <input type="number" value={it.quantity} onChange={e => { const n=[...editItems]; n[i].quantity=parseFloat(e.target.value); setEditItems(n); }} className="w-16 bg-white dark:bg-slate-800 border dark:border-white/5 rounded p-1 text-sm font-bold dark:text-white" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      req.items.map((it, i) => (
                        <div key={i} className="flex justify-between py-1 border-b dark:border-white/5 last:border-0">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{it.material}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{it.quantity} {it.unit}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-4">
                    <textarea placeholder="Add review notes..." value={pmNote} onChange={e => setPmNote(e.target.value)} className="w-full p-4 border dark:border-white/5 rounded-2xl text-sm bg-slate-50 dark:bg-white/5 dark:text-white" rows={2} />
                    <div className="flex gap-3">
                      <button onClick={() => handlePMAction(req.id, 'approve')} className="flex-[2] bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-2xl font-bold">Approve & Send to QS</button>
                      <button onClick={() => handlePMAction(req.id, 'reject')} className="flex-1 bg-white dark:bg-transparent border dark:border-red-900/30 text-red-600 py-3 rounded-2xl font-bold">Reject</button>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </motion.div>
        ) : activeTab === 'history' ? (
          <div className="space-y-6">
            {requestHistory.map(req => (
              <GlassCard key={req.id}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800 dark:text-white">Indent #{req.id.slice(-4)}</h4>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{req.status.replace(/_/g, ' ')}</span>
                </div>
                <IndentStatusTracker status={req.status} />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map(p => (
              <GlassCard key={p.id} className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{p.name}</h3>
                    <p className="text-sm text-slate-500 font-medium flex items-center mt-1">
                      <MapPin size={14} className="mr-1 opacity-40" /> {p.location}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <Building2 size={24} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border dark:border-white/5">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Project Head</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <User size={12} className="text-indigo-500" /> {p.projectManager}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border dark:border-white/5">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Site Engineer</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <User size={12} className="text-green-500" /> {p.siteEngineer}
                    </p>
                  </div>
                </div>

                {p.startDate && (
                  <div className="flex items-center justify-between mb-6 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-600" />
                      <div className="text-[10px] leading-none">
                        <p className="font-black text-slate-400 uppercase mb-0.5">Timeline</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">
                          {new Date(p.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - {new Date(p.endDate!).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Status</p>
                       <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{p.status}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className="text-blue-600">{p.progress}%</span>
                   </div>
                   <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${p.progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      />
                   </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </AnimatePresence>

      {showTaskForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
            <GlassCard className="!p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Assign Site Task</h3>
                <button onClick={() => setShowTaskForm(false)} className="text-slate-400 hover:text-slate-600"><XCircle /></button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Project</label>
                  <select 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/5 rounded-2xl font-bold dark:text-white"
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Task Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Concrete mix verification" 
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/5 rounded-2xl font-bold dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Priority</label>
                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => setTaskPriority(p as any)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${taskPriority === p ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleCreateTask}
                  className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-800 transition-all mt-4"
                >
                  Send to Site Engineer
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};

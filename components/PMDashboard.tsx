
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Search, ThumbsUp, ThumbsDown, Edit2, Save, PackageCheck, History, Clock, CheckCircle2, Package } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { IndentStatusTracker } from './IndentStatusTracker';
import { Project, ProjectTask, Notification, MaterialRequest, RequestItem } from '../types';

interface PMDashboardProps {
  projects: Project[];
  tasks: ProjectTask[];
  notifications: Notification[];
  requests?: MaterialRequest[];
  onAssignTask: (task: ProjectTask) => void;
  onClearNotification: (id: string) => void;
  onUpdateIndentStatus?: (id: string, status: string, payload?: any) => void;
}

export const PMDashboard: React.FC<PMDashboardProps> = ({ 
  projects, 
  requests = [],
  onUpdateIndentStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'approvals' | 'history'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Step 2 Editing state
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<RequestItem[]>([]);
  const [pmNote, setPmNote] = useState('');

  const pendingApprovals = requests.filter(req => 
    req.status === 'PM_Review' || req.status === 'Raised_By_SE'
  );

  const requestHistory = requests.filter(req => 
    req.status !== 'PM_Review' && req.status !== 'Raised_By_SE'
  );

  const startEdit = (req: MaterialRequest) => {
    setEditingReqId(req.id);
    setEditItems([...req.items]);
    setPmNote(req.pmComments || '');
  };

  const updateEditItem = (idx: number, field: keyof RequestItem, val: string | number) => {
    const next = [...editItems];
    next[idx] = { ...next[idx], [field]: val };
    setEditItems(next);
  };

  const handlePMAction = (id: string, action: 'approve' | 'reject') => {
    if (!onUpdateIndentStatus) return;
    const status = action === 'approve' ? 'QS_Analysis' : 'Rejected_By_PM';
    onUpdateIndentStatus(id, status, { 
      items: editItems.length > 0 ? editItems : undefined,
      pmComments: pmNote || (action === 'approve' ? 'Reviewed and forwarded to QS (Babu Sir)' : 'Rejected by PM') 
    });
    setEditingReqId(null);
    setPmNote('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('approvals')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Pending Approvals {pendingApprovals.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingApprovals.length}</span>}
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Tracking & History
          </button>
          <button onClick={() => setActiveTab('projects')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Site Overview
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search indents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'approvals' ? (
          <motion.div key="approvals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {pendingApprovals.length === 0 ? (
               <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                 <PackageCheck size={48} className="mx-auto mb-4 opacity-10" />
                 <p className="font-medium">No material indents waiting for your review.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingApprovals.map(req => (
                  <GlassCard key={req.id} className="border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                           {req.items.length}
                         </div>
                         <div>
                           <h3 className="font-bold text-slate-800 text-lg leading-none mb-1">Indent #{req.id.slice(-4)}</h3>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{req.projectName} • {req.requestedBy}</p>
                         </div>
                       </div>
                       <div className="flex space-x-2">
                         <button onClick={() => startEdit(req)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                       </div>
                    </div>
                    
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 mb-6">
                       {editingReqId === req.id ? (
                         <div className="space-y-3">
                           {editItems.map((item, idx) => (
                             <div key={idx} className="flex gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                               <input type="text" value={item.material} onChange={(e) => updateEditItem(idx, 'material', e.target.value)} className="flex-1 text-sm font-bold text-slate-700 bg-transparent focus:outline-none" />
                               <div className="flex items-center space-x-2 border-l pl-2 border-slate-200">
                                 <input type="number" value={item.quantity} onChange={(e) => updateEditItem(idx, 'quantity', parseFloat(e.target.value))} className="w-20 text-sm font-bold text-blue-600 bg-transparent focus:outline-none text-right" />
                                 <span className="text-xs text-slate-400 font-medium w-12">{item.unit}</span>
                               </div>
                             </div>
                           ))}
                           <p className="text-[10px] text-blue-500 font-bold pt-2 flex items-center"><Save size={12} className="mr-1"/> Edit Mode Active</p>
                         </div>
                       ) : (
                         <div className="space-y-1">
                           {req.items.map((item, idx) => (
                             <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-0">
                               <span className="text-sm font-medium text-slate-700">{item.material}</span>
                               <span className="text-sm font-bold text-slate-900">{item.quantity} {item.unit}</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>

                    <div className="space-y-4">
                       <textarea 
                         placeholder="Review Comments..." 
                         value={editingReqId === req.id ? pmNote : pmNote}
                         onChange={(e) => { setEditingReqId(req.id); setPmNote(e.target.value); }}
                         className="w-full p-4 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 transition-all"
                         rows={2}
                       />
                       <div className="flex flex-col sm:flex-row gap-3">
                         <button onClick={() => handlePMAction(req.id, 'approve')} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-xl transition-all">
                           <ThumbsUp size={18} /> Approve & Forward to Babu Sir
                         </button>
                         <button onClick={() => handlePMAction(req.id, 'reject')} className="flex-1 bg-white border border-red-200 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all">
                           Reject
                         </button>
                       </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        ) : activeTab === 'history' ? (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Indent Tracking (Step 3-10)</h2>
            {requestHistory.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                 <History size={48} className="mx-auto mb-4 opacity-10" />
                 <p className="text-slate-400">No past requests found.</p>
               </div>
            ) : (
              requestHistory.map(req => (
                <GlassCard key={req.id}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                      <p className="text-xs text-slate-500 uppercase font-bold">{req.projectName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${req.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <IndentStatusTracker status={req.status} />
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                     <span className="flex items-center"><Clock size={12} className="mr-1"/> {new Date(req.timestamp).toLocaleDateString()}</span>
                     <span className="flex items-center"><Package size={12} className="mr-1"/> {req.items.length} Materials</span>
                     {req.status === 'Completed' && <span className="flex items-center text-green-600"><CheckCircle2 size={12} className="mr-1"/> Fully Completed</span>}
                  </div>
                </GlassCard>
              ))
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <GlassCard key={project.id}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 rounded-2xl">
                    <Building2 size={24} />
                  </div>
                  <span className="text-lg font-bold text-slate-800">{project.progress}%</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{project.name}</h3>
                <p className="text-sm text-slate-500 flex items-center">
                  <MapPin size={14} className="mr-1" /> {project.location}
                </p>
              </GlassCard>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

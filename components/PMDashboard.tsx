
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, User, ArrowRight, Plus, Calendar, CheckCircle2, Circle, AlertCircle, ChevronLeft, Bell, X, PackageCheck, ThumbsUp, ThumbsDown, Edit2, Trash2, Save } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Project, ProjectTask, Notification, MaterialRequest, RequestItem } from '../types';

interface PMDashboardProps {
  projects: Project[];
  tasks: ProjectTask[];
  notifications: Notification[];
  requests?: MaterialRequest[];
  onAssignTask: (task: ProjectTask) => void;
  onClearNotification: (id: string) => void;
  onUpdateIndentStatus?: (id: string, status: string, payload?: any) => void;
  onDeleteIndent?: (id: string) => void;
}

export const PMDashboard: React.FC<PMDashboardProps> = ({ 
  projects, 
  tasks, 
  notifications,
  requests = [],
  onAssignTask,
  onClearNotification,
  onUpdateIndentStatus,
  onDeleteIndent
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'approvals'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Step 2 Editing state
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<RequestItem[]>([]);
  const [pmNote, setPmNote] = useState('');

  const pendingApprovals = requests.filter(req => req.status === 'PM_Review');

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
      pmComments: pmNote || (action === 'approve' ? 'Reviewed and forwarded to QS' : 'Rejected by PM') 
    });
    setEditingReqId(null);
    setPmNote('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 relative">
      <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-fit mb-8">
        <button onClick={() => setActiveTab('projects')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Site Overview</button>
        <button onClick={() => setActiveTab('approvals')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Indent Review (Step 2) {pendingApprovals.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingApprovals.length}</span>}</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'approvals' ? (
          <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">PM Review Dashboard (AI1002)</h2>
            {pendingApprovals.length === 0 ? (
               <div className="text-center py-20 text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                 <p>No indents waiting for PM review.</p>
               </div>
            ) : (
              <div className="space-y-6">
                {pendingApprovals.map(req => (
                  <GlassCard key={req.id} className="border-l-4 border-blue-500 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="font-bold text-slate-800 text-lg">Indent #{req.id.slice(-4)}</h3>
                         <p className="text-xs text-slate-500 font-medium">{req.projectName} • {req.requestedBy}</p>
                       </div>
                       <div className="flex space-x-2">
                         <button onClick={() => startEdit(req)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                         <button onClick={() => onDeleteIndent?.(req.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                       </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl mb-4">
                       {editingReqId === req.id ? (
                         <div className="space-y-3">
                           {editItems.map((item, idx) => (
                             <div key={idx} className="flex gap-2">
                               <input type="text" value={item.material} onChange={(e) => updateEditItem(idx, 'material', e.target.value)} className="flex-1 text-sm p-1 border rounded" />
                               <input type="number" value={item.quantity} onChange={(e) => updateEditItem(idx, 'quantity', parseFloat(e.target.value))} className="w-20 text-sm p-1 border rounded" />
                               <input type="text" value={item.unit} onChange={(e) => updateEditItem(idx, 'unit', e.target.value)} className="w-16 text-sm p-1 border rounded" />
                             </div>
                           ))}
                         </div>
                       ) : (
                         req.items.map((item, idx) => (
                           <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-100">
                             <span>{item.material}</span>
                             <span className="font-bold">{item.quantity} {item.unit}</span>
                           </div>
                         ))
                       )}
                    </div>

                    <div className="space-y-3">
                       <textarea 
                         placeholder="PM Review Notes..." 
                         value={editingReqId === req.id ? pmNote : ''}
                         onChange={(e) => { setEditingReqId(req.id); setPmNote(e.target.value); }}
                         className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                       />
                       <div className="flex gap-3">
                         <button onClick={() => handlePMAction(req.id, 'approve')} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><ThumbsUp size={16} /> Finalize & Forward to QS</button>
                         <button onClick={() => handlePMAction(req.id, 'reject')} className="px-6 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold">Reject</button>
                       </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Site Overview logic here... */
          <div className="text-slate-400">Project list display...</div>
        )}
      </AnimatePresence>
    </div>
  );
};

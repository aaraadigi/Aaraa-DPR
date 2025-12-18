
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Search, ThumbsUp, ThumbsDown, Edit2, Save, PackageCheck, History, Clock, CheckCircle2, Package, Image as ImageIcon, Calendar } from 'lucide-react';
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

export const PMDashboard: React.FC<PMDashboardProps> = ({ projects, requests = [], onUpdateIndentStatus }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'approvals' | 'history'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<RequestItem[]>([]);
  const [pmNote, setPmNote] = useState('');

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

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('approvals')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Pending ({pendingApprovals.length})
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Tracking
          </button>
          <button onClick={() => setActiveTab('projects')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Overview
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl text-sm" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'approvals' ? (
          <motion.div key="approvals" className="grid grid-cols-1 gap-6">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <PackageCheck size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-slate-400">All caught up! No pending indents.</p>
              </div>
            ) : (
              pendingApprovals.map(req => (
                <GlassCard key={req.id} className="border-l-4 border-blue-500">
                  <div className="flex justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg">{req.items.length}</div>
                      <div>
                        <h3 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase">{req.projectName} • {req.requestedBy}</p>
                      </div>
                    </div>
                    <button onClick={() => { setEditingId(req.id); setEditItems([...req.items]); }} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl mb-6">
                    {editingId === req.id ? (
                      <div className="space-y-2">
                        {editItems.map((it, i) => (
                          <div key={i} className="flex gap-2">
                            <input value={it.material} onChange={e => { const n=[...editItems]; n[i].material=e.target.value; setEditItems(n); }} className="flex-1 bg-white border rounded p-1 text-sm font-bold" />
                            <input type="number" value={it.quantity} onChange={e => { const n=[...editItems]; n[i].quantity=parseFloat(e.target.value); setEditItems(n); }} className="w-16 bg-white border rounded p-1 text-sm font-bold" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      req.items.map((it, i) => (
                        <div key={i} className="flex justify-between py-1 border-b last:border-0">
                          <span className="text-sm font-medium">{it.material}</span>
                          <span className="text-sm font-bold">{it.quantity} {it.unit}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-4">
                    <textarea placeholder="Add review notes..." value={pmNote} onChange={e => setPmNote(e.target.value)} className="w-full p-4 border rounded-2xl text-sm bg-slate-50" rows={2} />
                    <div className="flex gap-3">
                      <button onClick={() => handlePMAction(req.id, 'approve')} className="flex-[2] bg-slate-900 text-white py-3 rounded-2xl font-bold">Approve & Send to QS</button>
                      <button onClick={() => handlePMAction(req.id, 'reject')} className="flex-1 bg-white border text-red-600 py-3 rounded-2xl font-bold">Reject</button>
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
                  <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">{req.status.replace(/_/g, ' ')}</span>
                </div>
                <IndentStatusTracker status={req.status} />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map(p => (
              <GlassCard key={p.id}>
                <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                <p className="text-sm text-slate-500">{p.location}</p>
                <div className="mt-4 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${p.progress}%` }}></div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

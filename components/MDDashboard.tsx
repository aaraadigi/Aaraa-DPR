
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, ThumbsUp, Briefcase, Zap, MessageCircle, Clock, MapPin } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest, ProjectTask } from '../types';

interface MDDashboardProps {
  materialRequests: MaterialRequest[];
  tasks?: ProjectTask[];
  onUpdateIndentStatus: (id: string, status: string, payload?: any) => void;
}

export const MDDashboard: React.FC<MDDashboardProps> = ({ materialRequests, tasks = [], onUpdateIndentStatus }) => {
  const [viewTab, setViewTab] = useState<'approvals' | 'interactions'>('approvals');
  const pending = materialRequests.filter(req => req.status === 'MD_Final_Approval');
  const taskFeed = tasks.filter(t => t.response).slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Executive Control</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Management Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">High-level oversight of site operations and material flow.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl">
          <button 
            onClick={() => setViewTab('approvals')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewTab === 'approvals' ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}
          >
            Material Approvals ({pending.length})
          </button>
          <button 
            onClick={() => setViewTab('interactions')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewTab === 'interactions' ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}
          >
            Site Interactions ({taskFeed.length})
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {viewTab === 'approvals' ? (
          <>
            {pending.length === 0 ? (
              <div className="text-center py-24 bg-slate-900/5 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest text-xs">
                No requests pending management sign-off
              </div>
            ) : (
              pending.map(req => (
                <GlassCard key={req.id} className="border-l-4 border-slate-900 dark:border-indigo-600 bg-slate-50/30">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-slate-800 dark:text-white text-xl">Indent #{req.id.slice(-4)}</h3>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Urgent</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">{req.projectName}</p>
                      </div>
                      <div className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-500/20 animate-pulse tracking-widest">MD ACTION REQUIRED</div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Briefcase size={14} className="text-blue-500" /> Final Items
                         </h4>
                         {req.items.map((it, i) => (
                           <div key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300 py-2 border-b border-slate-50 dark:border-white/5 last:border-0 flex justify-between">
                             <span>{it.material}</span>
                             <span className="text-slate-900 dark:text-white">{it.quantity} {it.unit}</span>
                           </div>
                         ))}
                      </div>
                      <div className="bg-white dark:bg-[#1c1c1e] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm col-span-2">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <MessageCircle size={14} className="text-indigo-500" /> Approval Chain Logs
                         </h4>
                         <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PM Input (Mathi):</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">"{req.pmComments}"</p>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">QS Analysis (Babu):</p>
                              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">"{req.marketAnalysis}"</p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Ops Selection (Shanmugam):</p>
                              <p className="text-xs font-bold text-blue-700 dark:text-blue-300">"{req.opsComments}"</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => onUpdateIndentStatus(req.id, 'Finance_Payment_Pending', { mdComments: 'Final Approval Granted.' })} 
                     className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                   >
                     <ThumbsUp size={20} /> Authorize Procurement & Release Funds
                   </button>
                </GlassCard>
              ))
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {taskFeed.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-white dark:bg-[#2c2c2e] rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                <Zap size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-6" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No recent site engineer interactions detected</p>
              </div>
            ) : (
              taskFeed.map(task => (
                <GlassCard key={task.id} className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Zap size={80} />
                  </div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1">{task.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin size={12} className="text-indigo-500" /> {task.projectName}
                      </div>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">Response Logged</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                        <span>PM Task Definition:</span>
                        <span className="font-bold lowercase">from {task.assignedBy}</span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{task.description}"</p>
                    </div>
                    
                    <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative">
                      <div className="absolute -top-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-blue-600" />
                      <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1 flex justify-between items-center">
                        <span>SE Response ({task.assignedTo}):</span>
                        <span className="flex items-center gap-1"><Clock size={10}/> {new Date(task.respondedAt!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </p>
                      <p className="text-sm font-black tracking-tight leading-snug">"{task.response}"</p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

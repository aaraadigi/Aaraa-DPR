
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, ThumbsUp, Briefcase } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest } from '../types';

interface MDDashboardProps {
  materialRequests: MaterialRequest[];
  onUpdateIndentStatus: (id: string, status: string, payload?: any) => void;
}

export const MDDashboard: React.FC<MDDashboardProps> = ({ materialRequests, onUpdateIndentStatus }) => {
  const pending = materialRequests.filter(req => req.status === 'MD_Final_Approval');

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Management Dashboard (AI1001)</h2>
        <p className="text-slate-500">Step 6: Final Management Approval</p>
      </div>

      <div className="space-y-6">
        {pending.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/5 border border-dashed border-slate-200 rounded-2xl text-slate-400">No requests pending management sign-off.</div>
        ) : (
          pending.map(req => (
            <GlassCard key={req.id} className="border-l-4 border-slate-900 bg-slate-50/30">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Indent #{req.id.slice(-4)}</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{req.projectName}</p>
                  </div>
                  <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full animate-pulse">ACTION REQUIRED</div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Final Items</h4>
                     {req.items.map((it, i) => <div key={i} className="text-xs py-1 border-b last:border-0">{it.material} - {it.quantity}</div>)}
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm col-span-2">
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Approval Chain Notes</h4>
                     <div className="space-y-2 text-[10px]">
                        <p><span className="font-bold">PM:</span> {req.pmComments}</p>
                        <p><span className="font-bold">QS:</span> {req.marketAnalysis}</p>
                        <p><span className="font-bold">Ops Head:</span> {req.opsComments}</p>
                     </div>
                  </div>
               </div>

               <button 
                 onClick={() => onUpdateIndentStatus(req.id, 'Finance_Payment_Pending', { mdComments: 'Final Approval Granted.' })} 
                 className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-xl"
               >
                 <ThumbsUp size={20} /> Grant Final Approval
               </button>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

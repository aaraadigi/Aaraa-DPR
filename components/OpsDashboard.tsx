
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Image as ImageIcon, Briefcase } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest } from '../types';

interface OpsDashboardProps {
  materialRequests: MaterialRequest[];
  onUpdateIndentStatus: (id: string, status: string, payload?: any) => void;
}

export const OpsDashboard: React.FC<OpsDashboardProps> = ({ materialRequests, onUpdateIndentStatus }) => {
  const [note, setNote] = useState('');
  const pending = materialRequests.filter(req => req.status === 'Ops_Approval');

  const handleOpsApproval = (id: string) => {
    onUpdateIndentStatus(id, 'MD_Final_Approval', { opsComments: note || 'Selected most competitive vendor quotation.' });
    setNote('');
    alert("Selection finalized. Forwarded to Managing Director.");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <Briefcase size={28} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Operations Head Dashboard</h2>
        <p className="text-slate-500 font-medium">AI1022 - Shanmugam | Step 5: Vendor Finalization</p>
      </div>

      <div className="space-y-6">
        {pending.length === 0 ? (
          <div className="text-center py-24 bg-white/50 border border-dashed border-slate-200 rounded-3xl text-slate-400">
            <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">No quotations waiting for your selection.</p>
          </div>
        ) : (
          pending.map(req => (
            <GlassCard key={req.id} className="border-l-4 border-blue-600 overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xl tracking-tight">Indent #{req.id.slice(-4)}</h3>
                    <p className="text-sm text-slate-500 font-medium">{req.projectName}</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Awaiting Selection</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Market Quotes (3 Required)</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                       {req.quotes?.map((q, i) => (
                         <div key={i} className="flex-shrink-0 w-32 h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:scale-[1.05] transition-transform">
                            <img src={q} className="w-full h-full object-cover" alt={`Quote ${i+1}`} />
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Item Specifications</h4>
                     {req.items.map((it, idx) => (
                       <div key={idx} className="flex justify-between py-2 border-b border-slate-200 last:border-0">
                         <span className="text-slate-600 font-medium">{it.material}</span>
                         <span className="font-bold text-slate-900">{it.quantity} {it.unit}</span>
                       </div>
                     ))}
                     {req.marketAnalysis && (
                       <div className="mt-4 p-3 bg-purple-50 text-purple-700 text-xs rounded-xl italic border border-purple-100">
                         <strong>QS Input:</strong> {req.marketAnalysis}
                       </div>
                     )}
                  </div>
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-100">
                  <textarea placeholder="Final Selection Justification..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:outline-none focus:border-blue-500 transition-all" rows={3} />
                  <div className="flex gap-4">
                    <button onClick={() => onUpdateIndentStatus(req.id, 'PM_Review', { opsComments: 'Returned for re-review.' })} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors">Return to PM</button>
                    <button onClick={() => handleOpsApproval(req.id)} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all">
                      <CheckCircle2 size={20} /> Approve Best Quote & Send to MD
                    </button>
                  </div>
               </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
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
    onUpdateIndentStatus(id, 'MD_Final_Approval', { opsComments: note || 'Finalized best quotation.' });
    setNote('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Operations Head Dashboard (AI1022)</h2>
        <p className="text-slate-500">Step 5: Review & Finalize Vendor Quotations</p>
      </div>

      <div className="space-y-6">
        {pending.length === 0 ? (
          <div className="text-center py-20 bg-white/50 border border-dashed border-slate-200 rounded-2xl text-slate-400">No quotes waiting for Ops approval.</div>
        ) : (
          pending.map(req => (
            <GlassCard key={req.id} className="border-l-4 border-blue-600">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Indent #{req.id.slice(-4)}</h3>
                    <p className="text-xs text-slate-500">{req.projectName}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Vendor Quotations</h4>
                    <div className="flex gap-2">
                       {req.quotes?.map((q, i) => (
                         <div key={i} className="w-24 h-24 rounded-lg overflow-hidden border shadow-sm cursor-zoom-in">
                            <img src={q} className="w-full h-full object-cover" />
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                     {req.items.map((it, idx) => (
                       <div key={idx} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                         <span>{it.material}</span>
                         <span className="font-bold">{it.quantity} {it.unit}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <textarea placeholder="Final Quotation Review Notes..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                  <button onClick={() => handleOpsApproval(req.id)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700">
                    <CheckCircle2 size={18} /> Finalize Selection & Forward to MD
                  </button>
               </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

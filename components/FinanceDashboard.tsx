
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, CheckCircle2, FileText, CreditCard, ShieldCheck } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest } from '../types';

interface FinanceDashboardProps {
  materialRequests: MaterialRequest[];
  onUpdateStatus: (id: string, status: string, payload?: any) => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ materialRequests, onUpdateStatus }) => {
  const [payRef, setPayRef] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingPayments = materialRequests.filter(req => req.status === 'Finance_Payment_Pending');
  const grnReview = materialRequests.filter(req => req.status === 'GRN_Pending');

  const processPayment = (id: string) => {
    if (!payRef) return alert("Please enter a Payment Reference/UTR Number.");
    onUpdateStatus(id, 'Procurement_Dispatch', { paymentRef: payRef });
    setPayRef('');
    setSelectedId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 font-inter">
      <div className="mb-8 border-b border-slate-100 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finance Portal (AI1012)</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Financial Control & Disbursement</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
          <ShieldCheck size={28} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs"><CreditCard size={18} className="text-indigo-600"/> Vendor Disbursements</h3>
            {pendingPayments.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">No pending payments for today.</div>
            ) : (
              pendingPayments.map(req => (
                <GlassCard key={req.id} className="border-l-4 border-indigo-500 hover:shadow-xl transition-all">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-extrabold text-slate-900">Indent #{req.id.slice(-4)}</h4>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">MD Approved</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-xs mb-6 border border-slate-100">
                     <p className="font-black text-slate-400 uppercase mb-2 text-[9px]">Requirement:</p>
                     {req.items.map((it, i) => <div key={i} className="font-bold text-slate-700 py-1 flex justify-between"><span>{it.material}</span> <span>{it.quantity} {it.unit}</span></div>)}
                  </div>
                  <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">UTR Number / Payment Ref</label>
                       <input 
                         type="text" 
                         placeholder="Enter Payment Reference..." 
                         value={selectedId === req.id ? payRef : ''}
                         onChange={(e) => { setSelectedId(req.id); setPayRef(e.target.value); }}
                         className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:border-indigo-500 bg-white"
                       />
                    </div>
                    <button onClick={() => processPayment(req.id)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl">Complete Payment Session</button>
                  </div>
                </GlassCard>
              ))
            )}
         </div>

         <div className="space-y-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs"><FileText size={18} className="text-blue-600"/> Final GRN & Bill Audit</h3>
            {grnReview.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">No bills pending verification.</div>
            ) : (
              grnReview.map(req => (
                 <GlassCard key={req.id} className="border-l-4 border-blue-400">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-extrabold text-slate-900">Indent #{req.id.slice(-4)}</h4>
                      {req.vendorBillPhoto ? (
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">Evidence Uploaded</span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase animate-pulse">Waiting for Site</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-4 font-medium italic">Monitoring site engineer response for signed GRN and original vendor invoice...</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-1/3 h-full bg-blue-500"
                       />
                    </div>
                 </GlassCard>
              ))
            )}
         </div>
      </div>
    </div>
  );
};

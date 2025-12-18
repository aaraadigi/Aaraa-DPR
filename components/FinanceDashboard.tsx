
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, CheckCircle2, FileText, CreditCard } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Finance Portal (AI1012)</h2>
        <p className="text-slate-500">Step 7: Vendor Payments & Step 9: GRN Review</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><CreditCard size={18}/> Pending Vendor Payments</h3>
            {pendingPayments.map(req => (
              <GlassCard key={req.id} className="border-l-4 border-emerald-500">
                <div className="flex justify-between mb-4">
                  <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Approved by MD</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-xs mb-4">
                   {req.items.map((it, i) => <div key={i}>{it.material} - {it.quantity} {it.unit}</div>)}
                </div>
                <div className="space-y-2">
                   <input 
                     type="text" 
                     placeholder="UTR No / Payment Ref..." 
                     value={selectedId === req.id ? payRef : ''}
                     onChange={(e) => { setSelectedId(req.id); setPayRef(e.target.value); }}
                     className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                   />
                   <button onClick={() => processPayment(req.id)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">Confirm Payment Made</button>
                </div>
              </GlassCard>
            ))}
         </div>

         <div className="space-y-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={18}/> GRN & Bill Verification</h3>
            {grnReview.map(req => (
               <GlassCard key={req.id} className="border-l-4 border-blue-400">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                    {req.vendorBillPhoto ? <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Bill Uploaded</span> : <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Pending Site Input</span>}
                  </div>
                  <div className="text-xs text-slate-500 mb-4 italic">Waiting for Site Engineer to upload signed GRN and Vendor Bill...</div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                     <div className="w-2/3 h-full bg-blue-500 animate-pulse"></div>
                  </div>
               </GlassCard>
            ))}
         </div>
      </div>
    </div>
  );
};

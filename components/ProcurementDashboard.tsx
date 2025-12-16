import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, PackageCheck, ShoppingCart, Clock, ArrowRight, CheckCircle2, AlertCircle, X, Send, Building2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest } from '../types';

interface ProcurementDashboardProps {
  materialRequests: MaterialRequest[];
  onUpdateIndentStatus: (id: string, status: string, payload?: any) => void;
}

export const ProcurementDashboard: React.FC<ProcurementDashboardProps> = ({ 
  materialRequests,
  onUpdateIndentStatus 
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'po' | 'history'>('review');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [poNumber, setPoNumber] = useState('');

  // 1. Review Stage (Pending Procurement)
  const pendingReview = materialRequests.filter(req => req.status === 'Pending_Procurement');
  // 2. PO Stage (Approved by PM)
  const pendingPO = materialRequests.filter(req => req.status === 'Approved_By_PM');
  
  const handleForwardToPM = (id: string) => {
    onUpdateIndentStatus(id, 'Pending_PM', { procurementComments: comments || 'Stock checked. Price estimated.' });
    setComments('');
    setSelectedReqId(null);
  };

  const handleReturnToSE = (id: string) => {
    if (!comments) return alert("Please add a reason for returning.");
    onUpdateIndentStatus(id, 'Returned_To_SE', { procurementComments: comments });
    setComments('');
    setSelectedReqId(null);
  };

  const handleRaisePO = (id: string) => {
    if (!poNumber) return alert("Please enter PO Number.");
    onUpdateIndentStatus(id, 'PO_Raised', { poNumber });
    setPoNumber('');
    setSelectedReqId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Procurement Dashboard</h2>
        <p className="text-slate-500">Step 2: Review Indents & Step 4: Raise POs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard onClick={() => setActiveTab('review')} className="cursor-pointer border-l-4 border-l-blue-500">
           <div className="flex justify-between items-center mb-2">
             <span className="text-xs font-bold text-slate-500 uppercase">Step 2</span>
             <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{pendingReview.length}</div>
           </div>
           <h3 className="text-xl font-bold text-slate-800">Indent Review</h3>
           <p className="text-xs text-slate-400">Check Stock & Price</p>
        </GlassCard>
        
        <GlassCard onClick={() => setActiveTab('po')} className="cursor-pointer border-l-4 border-l-green-500">
           <div className="flex justify-between items-center mb-2">
             <span className="text-xs font-bold text-slate-500 uppercase">Step 4</span>
             <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">{pendingPO.length}</div>
           </div>
           <h3 className="text-xl font-bold text-slate-800">Raise PO</h3>
           <p className="text-xs text-slate-400">For Approved Indents</p>
        </GlassCard>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'review' && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <h3 className="font-bold text-slate-700 mb-2">Pending Indents for Review</h3>
            {pendingReview.length === 0 && <p className="text-slate-400 italic">No new indents from Site Engineers.</p>}
            
            {pendingReview.map(req => (
              <GlassCard key={req.id} className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${req.urgency === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{req.urgency} Urgency</span>
                      {req.projectName && (
                         <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                           <Building2 size={12} className="mr-1"/> {req.projectName}
                         </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>{new Date(req.date).toLocaleDateString()}</p>
                    <p>{req.requestedBy}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 mb-4">
                   {req.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between border-b border-slate-200 last:border-0 py-1">
                       <span>{item.material}</span>
                       <span className="font-medium">{item.quantity} {item.unit}</span>
                     </div>
                   ))}
                   {req.notes && <p className="mt-2 text-xs italic text-slate-500">Note: {req.notes}</p>}
                </div>

                <div className="flex flex-col gap-2">
                   <textarea 
                     placeholder="Add comments (Price estimate, stock availability, or return reason)..."
                     value={selectedReqId === req.id ? comments : ''}
                     onChange={(e) => {
                       setSelectedReqId(req.id);
                       setComments(e.target.value);
                     }}
                     className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                   />
                   <div className="flex gap-3">
                     <button 
                       onClick={() => handleForwardToPM(req.id)}
                       className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-800"
                     >
                       Forward to PM
                     </button>
                     <button 
                       onClick={() => handleReturnToSE(req.id)}
                       className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-50"
                     >
                       Return to SE
                     </button>
                   </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {activeTab === 'po' && (
          <motion.div key="po" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
             <h3 className="font-bold text-slate-700 mb-2">Approved Indents (Ready for PO)</h3>
             {pendingPO.length === 0 && <p className="text-slate-400 italic">No approved indents waiting for PO.</p>}

             {pendingPO.map(req => (
               <GlassCard key={req.id} className="border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                       <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-green-600 font-bold flex items-center"><CheckCircle2 size={12} className="mr-1"/> Approved by PM</p>
                          {req.projectName && (
                             <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                               <Building2 size={12} className="mr-1"/> {req.projectName}
                             </span>
                          )}
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 mb-4">
                     {req.items.map((item, idx) => (
                       <div key={idx} className="flex justify-between">
                         <span>{item.material}</span>
                         <span className="font-medium">{item.quantity} {item.unit}</span>
                       </div>
                     ))}
                     {req.pmComments && <p className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">PM Note: {req.pmComments}</p>}
                  </div>

                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Enter PO Number / Vendor"
                      value={selectedReqId === req.id ? poNumber : ''}
                      onChange={(e) => {
                         setSelectedReqId(req.id);
                         setPoNumber(e.target.value);
                      }}
                      className="flex-grow p-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-green-500"
                    />
                    <button 
                      onClick={() => handleRaisePO(req.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                    >
                      Raise PO
                    </button>
                  </div>
               </GlassCard>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
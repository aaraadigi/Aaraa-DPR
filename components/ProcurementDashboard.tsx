
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, PackageCheck, Upload, X, Camera, Send, CheckCircle2, Clock } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'quoting' | 'dispatch'>('quoting');
  const [quotePhotos, setQuotePhotos] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingQuoting = materialRequests.filter(req => req.status === 'Procurement_Quoting');
  const pendingDispatch = materialRequests.filter(req => req.status === 'Procurement_Dispatch');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) setQuotePhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const submitQuotes = (id: string) => {
    if (quotePhotos.length < 3) return alert("You must upload at least 3 quotations from different vendors.");
    onUpdateIndentStatus(id, 'Ops_Approval', { quotes: quotePhotos });
    setQuotePhotos([]);
    setSelectedId(null);
  };

  const markInTransit = (id: string) => {
    onUpdateIndentStatus(id, 'GRN_Pending', { procurementComments: 'Material dispatched to site. Status: In Transit' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Procurement Team (AI1031)</h2>
        <div className="flex space-x-2 mt-4">
           <button onClick={() => setActiveTab('quoting')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'quoting' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 shadow-sm'}`}>Step 4: Quoting</button>
           <button onClick={() => setActiveTab('dispatch')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'dispatch' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 shadow-sm'}`}>Step 8: Follow-up</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'quoting' ? (
          <motion.div key="quoting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <h3 className="font-bold text-slate-700">Pending Vendor Quotations</h3>
             {pendingQuoting.map(req => (
               <GlassCard key={req.id} className="border-l-4 border-indigo-500">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                      <p className="text-xs text-slate-500">{req.projectName}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl mb-6">
                    {req.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                        <span>{item.material}</span>
                        <span className="font-bold">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                    {req.marketAnalysis && <div className="mt-3 p-2 bg-purple-50 text-purple-700 text-[10px] rounded italic">QS Analysis: {req.marketAnalysis}</div>}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Upload 3 Vendor Quotes (Required)</label>
                    <div className="flex flex-wrap gap-2">
                       {quotePhotos.map((p, i) => (
                         <div key={i} className="w-20 h-20 relative rounded-lg overflow-hidden border">
                           <img src={p} className="w-full h-full object-cover" />
                           <button onClick={() => setQuotePhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={10}/></button>
                         </div>
                       ))}
                       {quotePhotos.length < 3 && (
                         <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 text-slate-400">
                           <Camera size={20} />
                           <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                         </label>
                       )}
                    </div>
                    <button 
                      onClick={() => submitQuotes(req.id)}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      disabled={quotePhotos.length < 3}
                    >
                      <Send size={18} /> Forward to Ops Head (Shanmugam)
                    </button>
                  </div>
               </GlassCard>
             ))}
          </motion.div>
        ) : (
          <motion.div key="dispatch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <h3 className="font-bold text-slate-700">Transit & Follow-up</h3>
             {pendingDispatch.map(req => (
               <GlassCard key={req.id} className="border-l-4 border-amber-500">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">Payment Success</span>
                  </div>
                  <div className="flex items-center text-amber-600 text-sm font-bold mb-4">
                    <Clock size={16} className="mr-2" /> Pending Dispatch from Vendor
                  </div>
                  <button onClick={() => markInTransit(req.id)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Truck size={18} /> Confirm Dispatch to Site
                  </button>
               </GlassCard>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

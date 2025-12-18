
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, CheckCircle2, TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest } from '../types';

interface CostingDashboardProps {
  materialRequests: MaterialRequest[];
  onUpdateIndentStatus: (id: string, status: string, payload?: any) => void;
}

export const CostingDashboard: React.FC<CostingDashboardProps> = ({ 
  materialRequests,
  onUpdateIndentStatus 
}) => {
  const [analysis, setAnalysis] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pending = materialRequests.filter(req => req.status === 'QS_Analysis');

  const handleQSApproval = (id: string, suggestion: 'GO' | 'HOLD') => {
    const note = suggestion === 'GO' ? 'Price is cheep/fair - Go for it.' : 'Market is costly - Hold if possible.';
    onUpdateIndentStatus(id, 'Procurement_Quoting', {
      marketAnalysis: analysis || note,
      costingComments: `QS Recommendation: ${suggestion}`
    });
    setAnalysis('');
    setSelectedId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">QS & Billing Dashboard (AI1005)</h2>
        <p className="text-slate-500">Step 3: Market Price Analysis & Budget Check</p>
      </div>

      <AnimatePresence>
        {pending.length === 0 ? (
          <div className="text-center py-20 bg-white/50 border border-dashed border-slate-200 rounded-2xl">
            <Calculator className="mx-auto mb-4 opacity-20" size={40} />
            <p className="text-slate-400">No indents pending market analysis.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.map(req => (
              <GlassCard key={req.id} className="border-l-4 border-purple-500">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Indent #{req.id.slice(-4)}</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{req.projectName}</p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Approved by PM</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl mb-4 text-sm">
                   {req.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between py-1 border-b border-slate-200 last:border-0">
                       <span>{item.material}</span>
                       <span className="font-bold">{item.quantity} {item.unit}</span>
                     </div>
                   ))}
                   {req.pmComments && <div className="mt-3 text-[10px] text-slate-400">PM Note: {req.pmComments}</div>}
                </div>

                <div className="space-y-4">
                   <textarea 
                     placeholder="Enter Market Price Analysis (e.g., Current Steel rate is ₹65/kg...)"
                     value={selectedId === req.id ? analysis : ''}
                     onChange={(e) => { setSelectedId(req.id); setAnalysis(e.target.value); }}
                     className="w-full p-3 border border-slate-200 rounded-xl text-sm"
                     rows={3}
                   />
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleQSApproval(req.id, 'GO')}
                        className="bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700"
                      >
                        <TrendingDown size={18} /> Price Cheap - GO
                      </button>
                      <button 
                        onClick={() => handleQSApproval(req.id, 'HOLD')}
                        className="bg-amber-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700"
                      >
                        <TrendingUp size={18} /> Price Costly - HOLD
                      </button>
                   </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

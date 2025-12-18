
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, CheckCircle2, TrendingUp, TrendingDown, Clock, ShieldCheck, IndianRupee, AlertCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest, RequestItem } from '../types';

interface CostingDashboardProps {
  materialRequests: MaterialRequest[];
  onUpdateIndentStatus: (id: string, status: string, payload?: any) => void;
}

// Local interface for items with target rates added by QS
interface QSRequestItem extends RequestItem {
  targetRate?: number;
}

export const CostingDashboard: React.FC<CostingDashboardProps> = ({ 
  materialRequests,
  onUpdateIndentStatus 
}) => {
  const [analysis, setAnalysis] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<QSRequestItem[]>([]);

  const pending = materialRequests.filter(req => req.status === 'QS_Analysis');

  // Initialize editing items when a request is picked up or lists change
  useEffect(() => {
    if (selectedId) {
      const req = pending.find(r => r.id === selectedId);
      if (req) {
        setEditingItems([...req.items]);
      }
    } else if (pending.length > 0 && !selectedId) {
      // Auto-select first one for better UX
      setSelectedId(pending[0].id);
      setEditingItems([...pending[0].items]);
    }
  }, [selectedId, materialRequests]);

  const handleRateChange = (idx: number, rate: number) => {
    const next = [...editingItems];
    next[idx] = { ...next[idx], targetRate: rate };
    setEditingItems(next);
  };

  const handleQSApproval = (id: string, suggestion: 'GO' | 'HOLD') => {
    if (!analysis.trim()) return;

    const note = suggestion === 'GO' ? 'Price is fair/cheap - Proceed with procurement.' : 'Market is currently costly - Consider holding if not critical.';
    
    // Calculate total budget for summary
    const totalEst = editingItems.reduce((acc, curr) => acc + ((curr.targetRate || 0) * curr.quantity), 0);

    onUpdateIndentStatus(id, 'Procurement_Quoting', {
      items: editingItems, // Save the items with their new targetRates
      marketAnalysis: analysis,
      costingComments: `QS Recommendation: ${suggestion} | Est. Total: ₹${totalEst.toLocaleString('en-IN')}`
    });
    
    setAnalysis('');
    setSelectedId(null);
  };

  const totalEstimated = editingItems.reduce((acc, curr) => acc + ((curr.targetRate || 0) * curr.quantity), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">QS & Billing Dashboard</h2>
          <p className="text-slate-500 font-medium">Step 3: Market Price Analysis & Budget Fixing (Babu Sir)</p>
        </div>
        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-700">{pending.length} Indents Pending Analysis</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {pending.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl"
          >
            <Calculator className="mx-auto mb-4 text-slate-200" size={48} />
            <h3 className="text-lg font-bold text-slate-400">All caught up!</h3>
            <p className="text-sm text-slate-400">No indents are waiting for market price analysis.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar List */}
            <div className="lg:col-span-4 space-y-4">
              {pending.map(req => (
                <div 
                  key={req.id}
                  onClick={() => setSelectedId(req.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedId === req.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Indent #{req.id.slice(-4)}</span>
                    <span className="text-[10px] font-black">{new Date(req.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold truncate">{req.projectName}</h4>
                  <p className="text-[10px] mt-1 opacity-70 italic">{req.items.length} materials requested</p>
                </div>
              ))}
            </div>

            {/* Analysis Workspace */}
            <div className="lg:col-span-8">
              {selectedId && (
                <GlassCard className="border-t-4 border-t-purple-600 !p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Review & Fix Budgets</h3>
                      <p className="text-sm text-slate-500 font-medium">Analyze market rates for the following items</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested By</p>
                       <p className="font-bold text-slate-700">{pending.find(r => r.id === selectedId)?.requestedBy}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Material List & Price Fixing</label>
                    <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <tr>
                            <th className="px-4 py-3">Material</th>
                            <th className="px-4 py-3 text-center">Qty</th>
                            <th className="px-4 py-3 text-right">Fixed Rate (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {editingItems.map((item, idx) => (
                            <tr key={idx} className="border-t border-slate-50">
                              <td className="px-4 py-4 text-sm font-bold text-slate-700">{item.material}</td>
                              <td className="px-4 py-4 text-sm text-center font-medium text-slate-500">{item.quantity} <span className="text-[10px] uppercase">{item.unit}</span></td>
                              <td className="px-4 py-4 text-right">
                                <div className="inline-flex items-center bg-slate-50 rounded-lg px-2 border border-slate-200 focus-within:border-blue-500 transition-colors">
                                  <span className="text-slate-400 text-xs mr-1">₹</span>
                                  <input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={item.targetRate || ''}
                                    onChange={(e) => handleRateChange(idx, parseFloat(e.target.value))}
                                    className="w-24 bg-transparent py-2 text-right text-sm font-bold text-blue-600 focus:outline-none"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                          <tr>
                            <td colSpan={2} className="px-4 py-4 text-xs font-bold uppercase tracking-widest">Estimated Project Cost</td>
                            <td className="px-4 py-4 text-right text-lg font-black">₹ {totalEstimated.toLocaleString('en-IN')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Market Analysis Details</label>
                        {analysis.length > 0 && <span className="text-[10px] font-bold text-green-500">Form valid to proceed</span>}
                      </div>
                      <textarea 
                        placeholder="Type your market price research here... (e.g. Verified with local vendors, Steel rates are currently ₹72/kg in the local market...)"
                        value={analysis}
                        onChange={(e) => setAnalysis(e.target.value)}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-sm text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-inner placeholder:text-slate-300"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleQSApproval(selectedId, 'GO')}
                        disabled={!analysis.trim()}
                        className={`
                          py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                          ${analysis.trim() 
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20 translate-y-0 opacity-100' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                          }
                        `}
                      >
                        <TrendingDown size={20} />
                        <span>Price Cheap - GO</span>
                      </button>

                      <button 
                        onClick={() => handleQSApproval(selectedId, 'HOLD')}
                        disabled={!analysis.trim()}
                        className={`
                          py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                          ${analysis.trim() 
                            ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/20 translate-y-0 opacity-100' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                          }
                        `}
                      >
                        <TrendingUp size={20} />
                        <span>Price Costly - HOLD</span>
                      </button>
                    </div>
                    {!analysis.trim() && (
                      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        Enter analysis notes above to enable decision buttons
                      </p>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

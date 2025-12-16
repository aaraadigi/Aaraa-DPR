import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, PieChart, CheckCircle2, XCircle, Clock, Package, TrendingUp, Users, ArrowRight, FileCheck } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { DPRRecord, MaterialRequest } from '../types';

interface FinanceDashboardProps {
  dprRecords: DPRRecord[];
  materialRequests: MaterialRequest[];
  onUpdateStatus: (id: string, status: string) => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ 
  dprRecords, 
  materialRequests,
  onUpdateStatus 
}) => {
  const [activeTab, setActiveTab] = useState<'payables' | 'reports'>('payables');

  // Calculations
  const pendingPayment = materialRequests.filter(req => req.status === 'Goods_Received');
  const closed = materialRequests.filter(req => req.status === 'Closed');

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Finance Dashboard</h2>
        <p className="text-slate-500">Step 6: Clear Vendor Payments</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl mb-6 w-fit">
        <button 
          onClick={() => setActiveTab('payables')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'payables' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Vendor Payments
        </button>
        <button 
           onClick={() => setActiveTab('reports')}
           className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Cost Reports
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'payables' ? (
          <motion.div
            key="payables"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-slate-700 mb-2">Pending Payments (Goods Received)</h3>
            {pendingPayment.length === 0 && <p className="text-slate-400 italic">No pending payments.</p>}

            {pendingPayment.map(req => (
              <GlassCard key={req.id} className="border-l-4 border-emerald-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                    <p className="text-xs text-slate-500">PO: {req.poNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">GRN Verified</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-sm mb-4">
                   <div className="flex items-center text-slate-700 font-bold mb-2">
                     <FileCheck size={16} className="mr-2 text-emerald-600"/>
                     GRN/Invoice: {req.grnDetails}
                   </div>
                   <ul className="text-slate-600 pl-6 list-disc">
                     {req.items.map((item, idx) => (
                       <li key={idx}>{item.material} - {item.quantity} {item.unit}</li>
                     ))}
                   </ul>
                </div>

                <button 
                  onClick={() => onUpdateStatus(req.id, 'Closed')}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg"
                >
                   Process Payment & Close Indent
                </button>
              </GlassCard>
            ))}

            <h3 className="font-bold text-slate-700 mt-8 mb-2">Payment History</h3>
            {closed.map(req => (
              <GlassCard key={req.id} className="opacity-75">
                 <div className="flex justify-between items-center">
                   <div>
                     <span className="font-bold text-slate-600">Indent #{req.id.slice(-4)}</span>
                     <span className="ml-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">PAID & CLOSED</span>
                   </div>
                   <p className="text-xs text-slate-400">PO: {req.poNumber}</p>
                 </div>
              </GlassCard>
            ))}

          </motion.div>
        ) : (
          <motion.div
             key="reports"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
          >
             {/* Existing Logic for Cost Reports or Placeholder */}
              <GlassCard className="!p-0 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Workers</th>
                    <th className="px-6 py-4">Activities</th>
                    <th className="px-6 py-4 text-right">Est. Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dprRecords.map(record => {
                    const dailyWorkers = record.labour.reduce((a, b) => a + b.count, 0);
                    const dailyCost = dailyWorkers * 800; // Est. rate
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {dailyWorkers}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {record.activities.map(a => a.description).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">
                          {dailyCost.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
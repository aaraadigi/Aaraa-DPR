
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Download, Printer, ChevronDown, ChevronUp, FileText, Package, AlertCircle, Clock, ArrowLeft, Camera } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { IndentStatusTracker } from './IndentStatusTracker';
import { DPRRecord, MaterialRequest } from '../types';

interface DPRViewerProps {
  records: DPRRecord[];
  materialRequests: MaterialRequest[];
  onBack?: () => void;
}

export const DPRViewer: React.FC<DPRViewerProps> = ({ records, materialRequests, onBack }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'requests'>('reports');
  const [filterDate, setFilterDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRecords = filterDate 
    ? records.filter(r => r.date.startsWith(filterDate))
    : records;

  const filteredRequests = filterDate
    ? materialRequests.filter(r => r.date.startsWith(filterDate))
    : materialRequests;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = "Date,Time,Activity Count,Worker Count,Labour Details,Safety Notes\n";
    const rows = filteredRecords.map(r => {
      const dateObj = new Date(r.date);
      const formattedDate = dateObj.toLocaleDateString();
      const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const workerCount = r.labour.reduce((a, b) => a + b.count, 0);
      const labourDetails = r.labour
        .map(l => {
          const namesPart = l.names ? `: ${l.names}` : '';
          return `${l.category} (${l.count})${namesPart}`;
        })
        .join(' | ');
      const escapedLabour = labourDetails.replace(/"/g, '""');
      const escapedSafety = r.safetyObservations ? r.safetyObservations.replace(/"/g, '""') : '';
      return `${formattedDate},${formattedTime},${r.activities.length},${workerCount},"${escapedLabour}","${escapedSafety}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DPR_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusStyle = (status: string) => {
     switch (status) {
       case 'Returned_To_SE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
       case 'Approved_By_PM': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
       case 'PO_Raised': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
       case 'Goods_Received': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
       case 'Rejected_By_PM': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
       case 'Closed': return 'bg-slate-800 text-white dark:bg-slate-700';
       default: return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
     }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 no-print">
        <div>
           <div className="flex items-center space-x-2">
             {onBack && (
               <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-[#2c2c2e] rounded-full transition-colors mr-2">
                 <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
               </button>
             )}
             <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Project Reports</h2>
           </div>
           <p className="text-slate-500 dark:text-slate-400 mt-2 ml-1">View and manage daily site progress and indents.</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="relative">
             <input 
               type="date" 
               className="pl-10 pr-4 py-2 bg-white dark:bg-[#2c2c2e] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-200 focus:outline-none focus:border-aaraa-blue"
               value={filterDate}
               onChange={(e) => setFilterDate(e.target.value)}
             />
             <Calendar className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={16} />
          </div>
           <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors shadow-lg shadow-slate-500/20 dark:shadow-blue-500/10"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-1 p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl mb-6 w-fit no-print">
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-[#3a3a3c] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          Site Reports
        </button>
        <button 
           onClick={() => setActiveTab('requests')}
           className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-[#3a3a3c] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          Material Indents
        </button>
      </div>

      <AnimatePresence mode='wait'>
        {activeTab === 'reports' ? (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <div className="flex justify-end mb-4 no-print">
               <button 
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-aaraa-blue dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
             </div>

            {filteredRecords.map((record) => (
              <GlassCard key={record.id} className="!p-0 overflow-hidden print:shadow-none print:border-b print:rounded-none">
                <div 
                  onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                  className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-aaraa-blue dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                      {new Date(record.date).getDate()}
                    </div>
                    <div>
                       <h3 className="font-semibold text-slate-800 dark:text-white leading-none mb-1">
                        {new Date(record.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric', weekday: 'long' })}
                       </h3>
                       <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                         <span className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                           <Clock size={12} />
                           {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         <span>{record.labour.reduce((a,b) => a+b.count, 0)} Workers</span>
                         <span>•</span>
                         <span>{record.activities.length} Activities</span>
                       </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end md:space-x-6 w-full md:w-auto no-print">
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">ID: {record.id}</span>
                    {expandedId === record.id ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {(expandedId === record.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 print:block print:h-auto print:opacity-100"
                    >
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Labour Breakdown</h4>
                            <div className="grid grid-cols-2 gap-3">
                               {record.labour.map(l => (
                                 <div key={l.category} className="p-3 bg-white dark:bg-[#1c1c1e] rounded-lg border border-slate-100 dark:border-white/5 shadow-sm">
                                   <div className="flex justify-between items-center mb-1">
                                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{l.category}</span>
                                     <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{l.count}</span>
                                   </div>
                                   {l.names && (
                                     <div className="mt-2 pt-2 border-t border-slate-50 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                       {l.names}
                                     </div>
                                   )}
                                 </div>
                               ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Materials Used</h4>
                             <div className="space-y-2">
                               {record.materials.length > 0 ? record.materials.map(m => (
                                 <div key={m.name} className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-white/5 pb-1">
                                   <span className="text-slate-600 dark:text-slate-400">{m.name}</span>
                                   <span className="font-medium text-slate-800 dark:text-white">{m.quantity} {m.unit}</span>
                                 </div>
                               )) : <span className="text-sm text-slate-400 dark:text-slate-500 italic">No materials recorded</span>}
                            </div>
                          </div>

                          {record.photos && record.photos.length > 0 && (
                            <div>
                               <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                                 <Camera size={14} className="mr-1" /> Site Photos
                               </h4>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                 {record.photos.map((photo, idx) => (
                                   <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                     <img src={photo} alt="Site" className="w-full h-full object-cover" />
                                   </div>
                                 ))}
                               </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                           <div>
                            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Activities</h4>
                            <div className="space-y-3">
                              {record.activities.map(act => {
                                const percentage = act.plannedQty > 0 ? (act.executedQty / act.plannedQty) * 100 : 0;
                                const displayPercentage = Math.min(100, Math.max(0, percentage));
                                const isOver = act.executedQty > act.plannedQty;
                                const isComplete = act.executedQty >= act.plannedQty;

                                return (
                                  <div key={act.id} className="p-3 bg-white dark:bg-[#1c1c1e] rounded-lg border border-slate-100 dark:border-white/5 shadow-sm">
                                    <div className="flex justify-between items-end mb-2">
                                      <div>
                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{act.description}</div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{act.unit}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Progress</div>
                                        <div>
                                          <span className={`text-base font-bold ${isOver ? 'text-amber-600 dark:text-amber-400' : isComplete ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-white'}`}>
                                            {act.executedQty}
                                          </span>
                                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">/ {act.plannedQty}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${displayPercentage}%` }}
                                        className={`h-full rounded-full ${
                                          isOver ? 'bg-amber-500' : 
                                          isComplete ? 'bg-green-500' : 
                                          'bg-blue-500'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                             <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Remarks</h4>
                             <div className="text-sm space-y-2">
                               <p><span className="font-semibold text-slate-700 dark:text-slate-300">Machinery:</span> <span className="text-slate-600 dark:text-slate-400">{record.machinery || '-'}</span></p>
                               <p><span className="font-semibold text-green-700 dark:text-green-400">Safety:</span> <span className="text-slate-600 dark:text-slate-400">{record.safetyObservations || 'None'}</span></p>
                               <p><span className="font-semibold text-red-600 dark:text-red-400">Risks:</span> <span className="text-slate-600 dark:text-slate-400">{record.risksAndDelays || 'None'}</span></p>
                               <p className="pt-2 border-t dark:border-white/5 mt-2 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">
                                 Submitted by {record.submittedBy}
                               </p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">No reports found</h3>
              </div>
            )}
          </motion.div>
        ) : (
           <motion.div 
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             {filteredRequests.map(req => (
               <GlassCard key={req.id}>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                   <div className="flex items-start space-x-4">
                     <div className={`p-3 rounded-xl ${
                       req.urgency === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                       'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                     }`}>
                       <Package size={24} />
                     </div>
                     <div>
                       <div className="flex items-center space-x-2 mb-1">
                         <h3 className="font-bold text-slate-800 dark:text-white text-lg">Indent #{req.id.slice(-4)}</h3>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(req.status)}`}>
                           {req.status.replace(/_/g, ' ')}
                         </span>
                       </div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                         <Clock size={12} className="mr-1" />
                         {new Date(req.timestamp).toLocaleString()} • Requested by {req.requestedBy}
                       </p>
                     </div>
                   </div>
                   
                   <div className="mt-4 md:mt-0">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          req.urgency === 'High' ? 'border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10' :
                          'border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10'
                      }`}>
                        {req.urgency} Urgency
                      </div>
                   </div>
                 </div>

                 {/* 7-Step Tracker Integrated Here */}
                 <div className="mb-8 bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <IndentStatusTracker status={req.status} />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">Items Requested</h4>
                      <div className="space-y-2">
                        {req.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex justify-between py-1 border-b border-slate-100 dark:border-white/5 last:border-0">
                            <span className="font-medium">{item.material}</span>
                            <span className="text-slate-500 dark:text-slate-400 font-bold">{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {req.notes && (
                        <div className="p-3 bg-white dark:bg-[#1c1c1e] border border-slate-100 dark:border-white/5 rounded-xl text-xs text-slate-500 dark:text-slate-400 shadow-sm">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] block mb-1">SE Note:</span>
                          {req.notes}
                        </div>
                      )}
                      {req.procurementComments && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs text-blue-700 dark:text-blue-300 shadow-sm">
                          <span className="font-bold text-blue-400 dark:text-blue-500 uppercase text-[9px] block mb-1">Procurement Review:</span>
                          {req.procurementComments}
                        </div>
                      )}
                      {req.pmComments && (
                        <div className={`p-3 border rounded-xl text-xs shadow-sm ${req.status === 'Rejected_By_PM' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-300' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-300'}`}>
                          <span className="font-bold uppercase text-[9px] block mb-1">PM Final Decision:</span>
                          {req.pmComments}
                        </div>
                      )}
                    </div>
                 </div>
               </GlassCard>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

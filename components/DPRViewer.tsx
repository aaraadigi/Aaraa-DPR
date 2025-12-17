import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Download, Printer, ChevronDown, ChevronUp, FileText, Package, AlertCircle, Clock, ArrowLeft, Camera } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
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
    // CSV logic remains same
    const headers = "Date,Activity Count,Worker Count,Labour Details,Safety Notes\n";
    const rows = filteredRecords.map(r => {
      const workerCount = r.labour.reduce((a, b) => a + b.count, 0);
      const labourDetails = r.labour
        .map(l => {
          const namesPart = l.names ? `: ${l.names}` : '';
          return `${l.category} (${l.count})${namesPart}`;
        })
        .join(' | ');
      const escapedLabour = labourDetails.replace(/"/g, '""');
      const escapedSafety = r.safetyObservations ? r.safetyObservations.replace(/"/g, '""') : '';
      return `${r.date},${r.activities.length},${workerCount},"${escapedLabour}","${escapedSafety}"`;
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
       case 'Pending': return 'bg-yellow-100 text-yellow-700';
       case 'Approved': return 'bg-blue-100 text-blue-700';
       case 'Ordered': return 'bg-purple-100 text-purple-700';
       case 'Fulfilled': return 'bg-green-100 text-green-700';
       case 'Rejected': return 'bg-red-100 text-red-700';
       default: return 'bg-slate-100 text-slate-700';
     }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Header & Controls - Hidden on Print */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 no-print">
        <div>
           <div className="flex items-center space-x-2">
             {onBack && (
               <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors mr-2">
                 <ArrowLeft size={20} className="text-slate-600" />
               </button>
             )}
             <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Project Reports</h2>
           </div>
           <p className="text-slate-500 mt-2 ml-1">View and manage daily site progress and indents.</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="relative">
             <input 
               type="date" 
               className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:border-aaraa-blue"
               value={filterDate}
               onChange={(e) => setFilterDate(e.target.value)}
             />
             <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
           <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-500/20"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl mb-6 w-fit no-print">
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Site Reports
        </button>
        <button 
           onClick={() => setActiveTab('requests')}
           className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                className="flex items-center space-x-2 px-4 py-2 text-sm text-aaraa-blue font-medium hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
             </div>

            {filteredRecords.map((record) => (
              <GlassCard key={record.id} className="!p-0 overflow-hidden print:shadow-none print:border-b print:rounded-none">
                {/* Summary Row */}
                <div 
                  onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                  className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between hover:bg-white/40 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-aaraa-blue flex items-center justify-center font-bold text-lg">
                      {new Date(record.date).getDate()}
                    </div>
                    <div>
                       <h3 className="font-semibold text-slate-800">{new Date(record.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric', weekday: 'long' })}</h3>
                       <div className="flex space-x-4 text-sm text-slate-500 mt-1">
                         <span>{record.labour.reduce((a,b) => a+b.count, 0)} Workers</span>
                         <span>•</span>
                         <span>{record.activities.length} Activities</span>
                       </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end md:space-x-6 w-full md:w-auto no-print">
                    <span className="text-xs font-mono text-slate-400">ID: {record.id}</span>
                    {expandedId === record.id ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Detail View - Always visible in Print */}
                <AnimatePresence>
                  {(expandedId === record.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-50/50 border-t border-slate-100 print:block print:h-auto print:opacity-100"
                    >
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Labour Breakdown</h4>
                            <div className="grid grid-cols-2 gap-3">
                               {record.labour.map(l => (
                                 <div key={l.category} className="p-3 bg-white rounded-lg border border-slate-100">
                                   <div className="flex justify-between items-center mb-1">
                                     <span className="text-sm font-medium text-slate-700">{l.category}</span>
                                     <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{l.count}</span>
                                   </div>
                                   {l.names && (
                                     <div className="mt-2 pt-2 border-t border-slate-50 text-xs text-slate-500 leading-relaxed">
                                       {l.names}
                                     </div>
                                   )}
                                 </div>
                               ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Materials Used</h4>
                             <div className="space-y-2">
                               {record.materials.length > 0 ? record.materials.map(m => (
                                 <div key={m.name} className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                                   <span className="text-slate-600">{m.name}</span>
                                   <span className="font-medium text-slate-800">{m.quantity} {m.unit}</span>
                                 </div>
                               )) : <span className="text-sm text-slate-400 italic">No materials recorded</span>}
                            </div>
                          </div>

                          {/* Photos Section */}
                          {record.photos && record.photos.length > 0 && (
                            <div>
                               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                                 <Camera size={14} className="mr-1" /> Site Photos
                               </h4>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                 {record.photos.map((photo, idx) => (
                                   <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-white border border-slate-200">
                                     <img src={photo} alt="Site" className="w-full h-full object-cover" />
                                   </div>
                                 ))}
                               </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                           <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Activities</h4>
                            <div className="space-y-3">
                              {record.activities.map(act => {
                                const percentage = act.plannedQty > 0 ? (act.executedQty / act.plannedQty) * 100 : 0;
                                const displayPercentage = Math.min(100, Math.max(0, percentage));
                                const isOver = act.executedQty > act.plannedQty;
                                const isComplete = act.executedQty >= act.plannedQty;

                                return (
                                  <div key={act.id} className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-end mb-2">
                                      <div>
                                        <div className="font-semibold text-slate-700 text-sm">{act.description}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{act.unit}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Progress</div>
                                        <div>
                                          <span className={`text-base font-bold ${isOver ? 'text-amber-600' : isComplete ? 'text-green-600' : 'text-slate-800'}`}>
                                            {act.executedQty}
                                          </span>
                                          <span className="text-xs text-slate-400 ml-1">/ {act.plannedQty}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${displayPercentage}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
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
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</h4>
                             <div className="text-sm space-y-2">
                               <p><span className="font-semibold text-slate-700">Machinery:</span> <span className="text-slate-600">{record.machinery || '-'}</span></p>
                               <p><span className="font-semibold text-green-700">Safety:</span> <span className="text-slate-600">{record.safetyObservations || 'None'}</span></p>
                               <p><span className="font-semibold text-red-600">Risks:</span> <span className="text-slate-600">{record.risksAndDelays || 'None'}</span></p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <style>{`
                  @media print {
                    .print-visible-${record.id} {
                      display: block !important;
                      height: auto !important;
                      opacity: 1 !important;
                    }
                  }
                `}</style>
              </GlassCard>
            ))}
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-600">No reports found</h3>
                <p className="text-slate-400">Try adjusting the date filter.</p>
              </div>
            )}
          </motion.div>
        ) : (
           <motion.div 
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
             {filteredRequests.map(req => (
               <GlassCard key={req.id} className="flex flex-col md:flex-row justify-between items-start md:items-center">
                 <div className="flex items-start space-x-4">
                   <div className={`p-3 rounded-xl ${
                     req.urgency === 'High' ? 'bg-red-100 text-red-600' :
                     req.urgency === 'Medium' ? 'bg-amber-100 text-amber-600' :
                     'bg-blue-100 text-blue-600'
                   }`}>
                     <Package size={24} />
                   </div>
                   <div>
                     <div className="flex items-center space-x-2 mb-1">
                       <h3 className="font-bold text-slate-800">Material Indent</h3>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(req.status)}`}>
                         {req.status}
                       </span>
                     </div>
                     <p className="text-xs text-slate-500 mb-3 flex items-center">
                       <Clock size={12} className="mr-1" />
                       {new Date(req.timestamp).toLocaleString()} • Requested by {req.requestedBy}
                     </p>
                     
                     <div className="space-y-1">
                       {req.items.map((item, idx) => (
                         <div key={idx} className="text-sm text-slate-700 flex items-center">
                           <span className="w-1 h-1 rounded-full bg-slate-400 mr-2"></span>
                           <span className="font-medium mr-2">{item.material}</span>
                           <span className="text-slate-500">{item.quantity} {item.unit}</span>
                         </div>
                       ))}
                     </div>
                     
                     {req.notes && (
                       <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-500 italic border border-slate-100 max-w-md">
                         Note: {req.notes}
                       </div>
                     )}
                   </div>
                 </div>
                 
                 <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                   <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      req.urgency === 'High' ? 'border-red-200 text-red-600 bg-red-50' :
                      req.urgency === 'Medium' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                      'border-green-200 text-green-600 bg-green-50'
                   }`}>
                     {req.urgency} Urgency
                   </div>
                 </div>
               </GlassCard>
             ))}

             {filteredRequests.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <Package size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-600">No material requests</h3>
                <p className="text-slate-400">All caught up.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
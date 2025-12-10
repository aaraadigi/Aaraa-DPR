import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Download, Printer, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { DPRRecord } from '../types';

interface DPRViewerProps {
  records: DPRRecord[];
}

export const DPRViewer: React.FC<DPRViewerProps> = ({ records }) => {
  const [filterDate, setFilterDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRecords = filterDate 
    ? records.filter(r => r.date.startsWith(filterDate))
    : records;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Simple CSV construction
    const headers = "Date,Activity Count,Worker Count,Safety Notes\n";
    const rows = filteredRecords.map(r => {
      const workerCount = r.labour.reduce((a, b) => a + b.count, 0);
      return `${r.date},${r.activities.length},${workerCount},"${r.safetyObservations.replace(/"/g, '""')}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DPR_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Header & Controls - Hidden on Print */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 no-print">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Project Reports</h2>
           <p className="text-slate-500 mt-2">View and manage daily site progress.</p>
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
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">CSV</span>
          </button>
           <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-500/20"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
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
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                       <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Activities</h4>
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 bg-slate-100 uppercase">
                            <tr>
                              <th className="px-2 py-1 rounded-l">Desc</th>
                              <th className="px-2 py-1">Unit</th>
                              <th className="px-2 py-1">Planned</th>
                              <th className="px-2 py-1 rounded-r">Exec</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.activities.map(act => (
                              <tr key={act.id} className="border-b border-slate-200/50">
                                <td className="px-2 py-2 font-medium">{act.description}</td>
                                <td className="px-2 py-2 text-slate-500">{act.unit}</td>
                                <td className="px-2 py-2">{act.plannedQty}</td>
                                <td className="px-2 py-2 text-aaraa-blue font-bold">{act.executedQty}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div>
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</h4>
                         <div className="text-sm space-y-2">
                           <p><span className="font-semibold text-slate-700">Machinery:</span> <span className="text-slate-600">{record.machinery || '-'}</span></p>
                           <p><span className="font-semibold text-green-700">Safety:</span> <span className="text-slate-600">{record.safetyObservations || 'None'}</span></p>
                           <p><span className="font-semibold text-red-600">Risks:</span> <span className="text-slate-600">{record.risksAndDelays || 'None'}</span></p>
                         </div>
                      </div>

                      <div className="pt-8 mt-4 border-t border-dashed border-slate-300">
                        <div className="flex justify-between items-end">
                          <div className="text-center">
                            <div className="h-10 border-b border-slate-400 w-32 mb-1"></div>
                            <span className="text-xs text-slate-400">Site Engineer</span>
                          </div>
                          <div className="text-center">
                             <div className="h-10 border-b border-slate-400 w-32 mb-1"></div>
                             <span className="text-xs text-slate-400">Project Manager</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* CSS hack to make expanded details visible on print regardless of state */}
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
            <h3 className="text-lg font-medium text-slate-600">No records found</h3>
            <p className="text-slate-400">Try adjusting the date filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
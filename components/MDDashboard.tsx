
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, CheckCircle2, ThumbsUp, Briefcase, Zap, 
  MessageCircle, Clock, MapPin, Building2, Users, 
  TrendingUp, Package, IndianRupee, Activity, Filter, 
  ChevronRight, ArrowUpRight, Search
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest, ProjectTask, Project, DPRRecord } from '../types';

interface MDDashboardProps {
  materialRequests: MaterialRequest[];
  tasks?: ProjectTask[];
  projects?: Project[];
  dprRecords?: DPRRecord[];
  onUpdateIndentStatus: (id: string, status: string, payload?: any) => void;
}

export const MDDashboard: React.FC<MDDashboardProps> = ({ 
  materialRequests, 
  tasks = [], 
  projects = [], 
  dprRecords = [],
  onUpdateIndentStatus 
}) => {
  const [viewTab, setViewTab] = useState<'overview' | 'approvals' | 'site_pulse'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Global Aggregate Stats
  const stats = useMemo(() => {
    const activeIndents = materialRequests.filter(r => r.status !== 'Completed' && r.status !== 'Rejected_By_PM').length;
    const totalWorkers = dprRecords.slice(0, projects.length).reduce((acc, dpr) => {
      // Logic: Only sum workers from today/latest report of each site
      return acc + (dpr.labour?.reduce((sum, l) => sum + l.count, 0) || 0);
    }, 0);
    const avgProgress = projects.length > 0 ? projects.reduce((acc, p) => acc + p.progress, 0) / projects.length : 0;

    return { activeIndents, totalWorkers, avgProgress };
  }, [materialRequests, dprRecords, projects]);

  const pending = materialRequests.filter(req => req.status === 'MD_Final_Approval');
  
  // Unified Site Pulse (Interactions + DPRs + New Indents)
  const sitePulse = useMemo(() => {
    const pulse = [
      ...tasks.filter(t => t.response).map(t => ({ ...t, pulseType: 'interaction' as const, time: t.respondedAt || '' })),
      ...dprRecords.map(d => ({ ...d, pulseType: 'dpr' as const, title: 'DPR Submitted', time: d.date })),
      ...materialRequests.filter(r => r.status === 'Raised_By_SE' || r.status === 'PM_Review').map(r => ({ ...r, pulseType: 'indent' as const, title: 'New Material Indent', time: r.date }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    return pulse.slice(0, 20);
  }, [tasks, dprRecords, materialRequests]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 font-inter">
      {/* Executive Header Section */}
      <div className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900 dark:bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Building2 size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <ShieldAlert size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Company Owner Perspective</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-none mb-2">AARAA Command Center</h2>
            <p className="text-indigo-100/70 font-medium">Real-time oversight of all infrastructure projects and financial commitments.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10 border-t lg:border-t-0 lg:border-l border-white/20 pt-6 lg:pt-0 lg:pl-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Total Workers</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{stats.totalWorkers}</span>
                <Users size={16} className="text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Active Indents</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{stats.activeIndents}</span>
                <Package size={16} className="text-amber-400" />
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Avg. Completion</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{Math.round(stats.avgProgress)}%</span>
                <TrendingUp size={16} className="text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-[1.5rem] shadow-inner border dark:border-white/5">
          {(['overview', 'approvals', 'site_pulse'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewTab === tab 
                ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-xl translate-y-0' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Project, Material or Site..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2c2c2e] border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all dark:text-white"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {projects.map(p => (
              <GlassCard key={p.id} className="group !p-8 hover:scale-[1.02] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <Activity size={100} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{p.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {p.location}
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                      <Building2 size={24} />
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-400">Construction Progress</span>
                      <span className="text-indigo-600">{p.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${p.progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border dark:border-white/5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Head</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.projectManager}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border dark:border-white/5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Site Status</p>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-widest">{p.status}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        ) : viewTab === 'approvals' ? (
          <motion.div 
            key="approvals" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-6"
          >
            {pending.length === 0 ? (
              <div className="text-center py-32 bg-slate-50 dark:bg-[#2c2c2e] rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/5">
                <CheckCircle2 size={64} className="mx-auto mb-6 text-slate-200" />
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Requests Pending Signature</h3>
              </div>
            ) : (
              pending.map(req => (
                <GlassCard key={req.id} className="border-l-8 border-slate-900 dark:border-white shadow-2xl !p-10">
                   <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-black text-slate-800 dark:text-white text-3xl tracking-tighter">Indent #{req.id.slice(-4)}</h3>
                          <span className="px-4 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">MD Sign-off Required</span>
                        </div>
                        <p className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{req.projectName}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized By Chain</span>
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-indigo-500 border-4 border-white dark:border-[#2c2c2e] flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-indigo-500/30">{i === 1 ? 'M' : i === 2 ? 'B' : 'S'}</div>)}
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                      <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 shadow-inner">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                           <Briefcase size={14} className="text-indigo-600" /> Material Specification
                         </h4>
                         <div className="space-y-3">
                           {req.items.map((it, i) => (
                             <div key={i} className="text-base font-black text-slate-700 dark:text-slate-300 py-3 border-b border-slate-50 dark:border-white/5 last:border-0 flex justify-between items-center group">
                               <span>{it.material}</span>
                               <span className="bg-slate-50 dark:bg-white/5 px-4 py-1.5 rounded-xl text-slate-900 dark:text-white border dark:border-white/5">{it.quantity} {it.unit}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                           <MessageCircle size={14} className="text-indigo-500" /> Executive Audit Logs
                         </h4>
                         <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border dark:border-white/5">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">PM Mathi Says:</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">"{req.pmComments || 'Requested quantities validated.'}"</p>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">QS Babu Analysis:</p>
                              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 italic">"{req.marketAnalysis || 'Market rates are favorable.'}"</p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                              <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Ops Selection:</p>
                              <p className="text-xs font-bold text-blue-700 dark:text-blue-300">"{req.opsComments || 'Vendor finalized after comparing quotes.'}"</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                     <button 
                       onClick={() => onUpdateIndentStatus(req.id, 'Finance_Payment_Pending', { mdComments: 'Final Approval Granted.' })} 
                       className="flex-[2] bg-slate-900 dark:bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-indigo-500/20"
                     >
                       <ThumbsUp size={24} /> Grant Final Authorization & Funds Release
                     </button>
                     <button 
                       onClick={() => onUpdateIndentStatus(req.id, 'PM_Review', { mdComments: 'MD Requesting re-evaluation.' })} 
                       className="flex-1 bg-white dark:bg-transparent text-slate-900 dark:text-white border-2 border-slate-200 dark:border-white/10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all"
                     >
                       Return for Review
                     </button>
                   </div>
                </GlassCard>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="site_pulse" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="text-indigo-600" /> Site Pulse Feed
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> Live Updates
              </div>
            </div>

            {sitePulse.map((item, idx) => (
              <GlassCard key={idx} className="!p-6 group relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-24 text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                </div>
                
                <div className="flex-grow flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                    item.pulseType === 'interaction' ? 'bg-indigo-500 text-white' :
                    item.pulseType === 'dpr' ? 'bg-green-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                    {item.pulseType === 'interaction' ? <Zap size={24} /> :
                     item.pulseType === 'dpr' ? <Activity size={24} /> :
                     <Package size={24} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded dark:text-slate-400">{item.projectName}</span>
                      <h4 className="text-base font-black text-slate-800 dark:text-white tracking-tight">
                        {item.pulseType === 'interaction' ? (item as any).title : (item as any).title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                      {item.pulseType === 'interaction' ? `"${(item as any).response}"` : 
                       item.pulseType === 'dpr' ? `Site Engineer logged manpower and progress data.` :
                       `A new procurement request has entered the workflow.`}
                    </p>
                  </div>
                </div>

                <div className="ml-auto flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest group-hover:gap-2 transition-all cursor-pointer">
                    View Details <ChevronRight size={12} />
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

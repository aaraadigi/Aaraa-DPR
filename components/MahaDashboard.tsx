
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Users, Package, Activity, ArrowRight, CheckCircle2, 
  Clock, FileText, Building2, ShieldAlert, Trash2, Database, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { DPREntryForm } from './DPREntryForm';
import { MaterialRequestForm } from './MaterialRequestForm';
import { DPRViewer } from './DPRViewer';
import { DPRRecord, MaterialRequest } from '../types';
import { supabase } from '../lib/supabaseClient';

interface MahaDashboardProps {
  userId: string;
  username: string;
  onSaveDPR: (dpr: DPRRecord) => void;
  onSaveMaterialRequest: (req: MaterialRequest) => void;
  recentDPRs: DPRRecord[];
  recentRequests: MaterialRequest[];
  defaultProjectName?: string;
}

export const MahaDashboard: React.FC<MahaDashboardProps> = ({ 
  userId,
  username,
  onSaveDPR, 
  onSaveMaterialRequest, 
  recentDPRs,
  recentRequests,
  defaultProjectName
}) => {
  const [view, setView] = useState<'dashboard' | 'dpr_form' | 'material_form' | 'all_reports' | 'maintenance'>('dashboard');
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredDPRs = defaultProjectName 
    ? recentDPRs.filter(d => d.projectName === defaultProjectName)
    : recentDPRs;
    
  const filteredRequests = defaultProjectName
    ? recentRequests.filter(r => r.projectName === defaultProjectName)
    : recentRequests;

  const lastDPR = filteredDPRs[0];
  const totalWorkers = lastDPR ? lastDPR.labour.reduce((acc, curr) => acc + curr.count, 0) : 0;
  const activeActivities = lastDPR ? lastDPR.activities.length : 0;

  const recentActivity = [
    ...filteredDPRs.map(d => ({ ...d, type: 'dpr' as const })),
    ...filteredRequests.map(r => ({ ...r, type: 'request' as const }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const handleClearTable = async (table: string) => {
    if (!window.confirm(`DANGER: This will permanently delete ALL data from ${table}. This cannot be undone. Are you sure?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Supabase delete requires a filter to be present. 
      // Using .neq('id', 'placeholder') or .gt('id', 0) to target all rows.
      const idColumn = (table === 'petty_cash' || table === 'daily_tasks') ? 'id' : 'id';
      const filterValue = (table === 'petty_cash' || table === 'daily_tasks') ? -1 : '_clear_all_';

      const { error } = await supabase
        .from(table)
        .delete()
        .neq(idColumn, filterValue);

      if (error) throw error;
      alert(`Success: ${table} has been cleared.`);
      window.location.reload(); // Refresh to clear local state
    } catch (err: any) {
      alert(`Error clearing ${table}: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (view === 'dpr_form') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button 
          onClick={() => setView('dashboard')}
          className="mb-4 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-aaraa-blue transition-colors flex items-center"
        >
          ← Back to Dashboard
        </button>
        <DPREntryForm 
          defaultProjectName={defaultProjectName}
          submittedBy={userId}
          onSave={(data) => {
            onSaveDPR(data);
          }} 
        />
      </motion.div>
    );
  }

  if (view === 'material_form') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button 
          onClick={() => setView('dashboard')}
          className="mb-4 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-aaraa-blue transition-colors flex items-center"
        >
          ← Back to Dashboard
        </button>
        <MaterialRequestForm
          projectName={defaultProjectName}
          userName={username}
          onSave={(data) => {
            onSaveMaterialRequest(data);
            setView('dashboard');
          }}
          onCancel={() => setView('dashboard')}
        />
      </motion.div>
    );
  }

  if (view === 'all_reports') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DPRViewer 
          records={filteredDPRs} 
          materialRequests={filteredRequests} 
          onBack={() => setView('dashboard')}
        />
      </motion.div>
    );
  }

  if (view === 'maintenance') {
    return (
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <button 
          onClick={() => setView('dashboard')}
          className="mb-6 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-aaraa-blue transition-colors flex items-center"
        >
          ← Back to Dashboard
        </button>
        
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={32} /> Maintenance Console
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Purge testing data and reset database tables to clean states.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="border-t-4 border-red-500 !p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Reports Cleanup</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Remove all submitted DPRs and Material Indents from the database. This is used for clearing test reports before moving to live operations.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => handleClearTable('dpr_records')}
                disabled={isDeleting}
                className="w-full bg-white dark:bg-white/5 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 size={18} /> Delete All DPRs
              </button>
              <button 
                onClick={() => handleClearTable('material_requests')}
                disabled={isDeleting}
                className="w-full bg-white dark:bg-white/5 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 size={18} /> Delete All Indents
              </button>
            </div>
          </GlassCard>

          <GlassCard className="border-t-4 border-amber-500 !p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                <RefreshCw size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ledger Resets</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Clear financial records and daily task journal entries. Useful for starting a new financial period or testing cycle.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => handleClearTable('petty_cash')}
                disabled={isDeleting}
                className="w-full bg-white dark:bg-white/5 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 size={18} /> Clear Petty Cash
              </button>
              <button 
                onClick={() => handleClearTable('daily_tasks')}
                disabled={isDeleting}
                className="w-full bg-white dark:bg-white/5 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 size={18} /> Reset Task Boards
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="mt-12 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-8 flex items-start gap-4">
          <AlertTriangle className="text-red-600 dark:text-red-400 mt-1" size={24} />
          <div>
            <h4 className="text-red-800 dark:text-red-400 font-bold mb-1">Warning: Irreversible Actions</h4>
            <p className="text-red-700 dark:text-red-300/70 text-sm leading-relaxed">
              Performing any cleanup action here will permanently erase data from the Supabase production environment. There is no backup or "undo" functionality for these maintenance operations. Ensure you have exported necessary CSV reports before proceeding.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          {defaultProjectName && (
             <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-aaraa-blue px-3 py-1 rounded-full text-xs font-bold mb-2 transition-colors">
               <Building2 size={12} className="mr-1" /> {defaultProjectName}
             </div>
          )}
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
             {defaultProjectName ? 'Site Dashboard' : `Good Morning, ${username.split(' ')[0]}.`}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Current site statistics and reporting controls.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('maintenance')}
            className="bg-white dark:bg-[#2c2c2e] text-red-500 dark:text-red-400 border border-red-100 dark:border-red-500/20 px-5 py-3 rounded-full font-bold shadow-sm flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <ShieldAlert size={20} />
            <span>Maintenance</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('all_reports')}
            className="bg-white dark:bg-[#2c2c2e] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 px-5 py-3 rounded-full font-semibold shadow-sm flex items-center space-x-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <FileText size={20} />
            <span>View All Reports</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('dpr_form')}
            className="bg-aaraa-blue text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/30 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Daily Report</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard delay={0.1} className="flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 transition-colors">
              <Users size={24} />
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Active</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{totalWorkers}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Workers on site (Last Report)</p>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="flex flex-col justify-between h-40">
           <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400 transition-colors">
              <Activity size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{activeActivities}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ongoing Activities</p>
          </div>
        </GlassCard>

        <GlassCard 
          delay={0.3} 
          onClick={() => setView('material_form')}
          className="flex flex-col justify-between h-40 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-indigo-600 dark:to-indigo-800 !text-white !border-white/10 cursor-pointer group hover:scale-[1.02] transition-transform"
        >
           <div className="flex items-start justify-between">
            <div className="p-3 bg-white/10 rounded-2xl text-white group-hover:bg-white/20 transition-colors">
              <Package size={24} />
            </div>
             <div className="p-2 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
               <Plus size={16} />
             </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/90">Material Request</h3>
            <p className="text-sm text-white/50 mt-1">Raise new indent</p>
          </div>
        </GlassCard>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">No reports submitted yet.</div>
          ) : (
            recentActivity.map((item, idx) => (
              <GlassCard key={item.id} delay={0.1 * idx} className="!p-4 flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  {item.type === 'dpr' ? (
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 transition-colors">
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors">
                      <Package size={20} />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">
                      {item.type === 'dpr' ? 'Site Report' : 'Material Indent'}
                      <span className="font-normal text-slate-500 dark:text-slate-400"> - {new Date(item.date).toLocaleDateString()}</span>
                    </h4>
                    {item.type === 'dpr' ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.labour.reduce((a, b) => a + b.count, 0)} Workers • {item.activities.length} Activities
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.items.length} Items • <span className={item.urgency === 'High' ? 'text-red-500 dark:text-red-400 font-medium' : ''}>{item.urgency} Urgency</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1">
                    <Clock size={12} />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

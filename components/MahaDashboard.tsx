import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Package, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { DPREntryForm } from './DPREntryForm';
import { DPRRecord } from '../types';

interface MahaDashboardProps {
  onSaveDPR: (dpr: DPRRecord) => void;
  recentDPRs: DPRRecord[];
}

export const MahaDashboard: React.FC<MahaDashboardProps> = ({ onSaveDPR, recentDPRs }) => {
  const [showForm, setShowForm] = useState(false);

  // Calculate simple stats for "Today" (simulated based on last entry)
  const lastDPR = recentDPRs[0];
  const totalWorkers = lastDPR ? lastDPR.labour.reduce((acc, curr) => acc + curr.count, 0) : 0;
  const activeActivities = lastDPR ? lastDPR.activities.length : 0;

  if (showForm) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button 
          onClick={() => setShowForm(false)}
          className="mb-4 px-4 py-2 text-sm font-medium text-slate-500 hover:text-aaraa-blue transition-colors flex items-center"
        >
          ← Back to Dashboard
        </button>
        <DPREntryForm 
          onSave={(data) => {
            onSaveDPR(data);
            setShowForm(false);
          }} 
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Good Morning, Maha.</h2>
          <p className="text-slate-500 mt-2">Here is the site overview for today.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-aaraa-blue text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/30 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Daily Report</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard delay={0.1} className="flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Users size={24} />
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{totalWorkers}</h3>
            <p className="text-sm text-slate-500">Workers on site (Last Report)</p>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="flex flex-col justify-between h-40">
           <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Activity size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{activeActivities}</h3>
            <p className="text-sm text-slate-500">Ongoing Activities</p>
          </div>
        </GlassCard>

        <GlassCard delay={0.3} className="flex flex-col justify-between h-40 bg-gradient-to-br from-slate-800 to-slate-900 !text-white !border-white/10">
           <div className="flex items-start justify-between">
            <div className="p-3 bg-white/10 rounded-2xl text-white">
              <Package size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/90">Material Request</h3>
            <p className="text-sm text-white/50 mt-1">Check inventory status</p>
          </div>
        </GlassCard>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Submissions</h3>
        <div className="space-y-4">
          {recentDPRs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No reports submitted yet.</div>
          ) : (
            recentDPRs.slice(0, 3).map((dpr, idx) => (
              <GlassCard key={dpr.id} delay={0.1 * idx} className="!p-4 flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Site Report - {new Date(dpr.date).toLocaleDateString()}</h4>
                    <p className="text-xs text-slate-500">{dpr.labour.reduce((a, b) => a + b.count, 0)} Workers • {dpr.activities.length} Activities</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(dpr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

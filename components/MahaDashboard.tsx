
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Package, Activity, ArrowRight, CheckCircle2, Clock, FileText, Building2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { DPREntryForm } from './DPREntryForm';
import { MaterialRequestForm } from './MaterialRequestForm';
import { DPRViewer } from './DPRViewer';
import { DPRRecord, MaterialRequest } from '../types';

interface MahaDashboardProps {
  onSaveDPR: (dpr: DPRRecord) => void;
  onSaveMaterialRequest: (req: MaterialRequest) => void;
  recentDPRs: DPRRecord[];
  recentRequests: MaterialRequest[];
  defaultProjectName?: string; // New Prop
  // Added username prop to fix TypeScript error in App.tsx where it's being passed
  username?: string;
}

export const MahaDashboard: React.FC<MahaDashboardProps> = ({ 
  onSaveDPR, 
  onSaveMaterialRequest, 
  recentDPRs,
  recentRequests,
  defaultProjectName,
  // Destructure username from props
  username
}) => {
  const [view, setView] = useState<'dashboard' | 'dpr_form' | 'material_form' | 'all_reports'>('dashboard');

  // Filter recents if defaultProjectName is set
  const filteredDPRs = defaultProjectName 
    ? recentDPRs.filter(d => d.projectName === defaultProjectName)
    : recentDPRs;
    
  const filteredRequests = defaultProjectName
    ? recentRequests.filter(r => r.projectName === defaultProjectName)
    : recentRequests;

  // Calculate stats based on filtered data
  const lastDPR = filteredDPRs[0];
  const totalWorkers = lastDPR ? lastDPR.labour.reduce((acc, curr) => acc + curr.count, 0) : 0;
  const activeActivities = lastDPR ? lastDPR.activities.length : 0;

  // Combine and sort recent activity
  const recentActivity = [
    ...filteredDPRs.map(d => ({ ...d, type: 'dpr' as const })),
    ...filteredRequests.map(r => ({ ...r, type: 'request' as const }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5); // Show top 5

  if (view === 'dpr_form') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button 
          onClick={() => setView('dashboard')}
          className="mb-4 px-4 py-2 text-sm font-medium text-slate-500 hover:text-aaraa-blue transition-colors flex items-center"
        >
          ← Back to Dashboard
        </button>
        <DPREntryForm 
          defaultProjectName={defaultProjectName}
          onSave={(data) => {
            onSaveDPR(data);
            setView('dashboard');
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
          className="mb-4 px-4 py-2 text-sm font-medium text-slate-500 hover:text-aaraa-blue transition-colors flex items-center"
        >
          ← Back to Dashboard
        </button>
        <MaterialRequestForm
          projectName={defaultProjectName}
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          {defaultProjectName && (
             <div className="inline-flex items-center bg-blue-100 text-aaraa-blue px-3 py-1 rounded-full text-xs font-bold mb-2">
               <Building2 size={12} className="mr-1" /> {defaultProjectName}
             </div>
          )}
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
             {/* Greeting updated to use username prop if available */}
             {defaultProjectName ? 'Site Dashboard' : `Good Morning, ${username || 'Maha'}.`}
          </h2>
          <p className="text-slate-500 mt-2">Here is the site overview for today.</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('all_reports')}
            className="bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-full font-semibold shadow-sm flex items-center space-x-2 hover:bg-slate-50"
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

        <GlassCard 
          delay={0.3} 
          onClick={() => setView('material_form')}
          className="flex flex-col justify-between h-40 bg-gradient-to-br from-slate-800 to-slate-900 !text-white !border-white/10 cursor-pointer group hover:scale-[1.02] transition-transform"
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
        <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No reports submitted yet.</div>
          ) : (
            recentActivity.map((item, idx) => (
              <GlassCard key={item.id} delay={0.1 * idx} className="!p-4 flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  {item.type === 'dpr' ? (
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Package size={20} />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {item.type === 'dpr' ? 'Site Report' : 'Material Indent'}
                      <span className="font-normal text-slate-500"> - {new Date(item.date).toLocaleDateString()}</span>
                    </h4>
                    {item.type === 'dpr' ? (
                      <p className="text-xs text-slate-500">
                        {item.labour.reduce((a, b) => a + b.count, 0)} Workers • {item.activities.length} Activities
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        {item.items.length} Items • <span className={item.urgency === 'High' ? 'text-red-500 font-medium' : ''}>{item.urgency} Urgency</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 flex items-center justify-end gap-1">
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

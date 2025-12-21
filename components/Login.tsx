
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, User, Info } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onLogin: (role: UserRole, username: string, userId: string) => void;
}

// Full Staff Roster mapped to system roles
const STAFF_ROSTER: Record<string, { name: string, role: UserRole }> = {
  'AI1001': { name: 'Nandakumar Kothandaraman', role: 'md' },
  'AI1002': { name: 'Mathiyazhagan', role: 'pm' },
  'AI1003': { name: 'Manikandan', role: 'generic' },
  'AI1004': { name: 'Alekhya B', role: 'generic' },
  'AI1005': { name: 'SS Babu', role: 'costing' },
  'AI1006': { name: 'Karthikeyan R', role: 'se' },
  'AI1007': { name: 'Elavarasan', role: 'se' },
  'AI1008': { name: 'Imtiaz', role: 'procurement' },
  'AI1009': { name: 'Mahalakshmi Krishnan', role: 'maha' },
  'AI1010': { name: 'Kavitha R', role: 'generic' },
  'AI1011': { name: 'Hajira S K', role: 'generic' },
  'AI1012': { name: 'Sudha Ramanathan', role: 'finance' },
  'AI1013': { name: 'Gowri Shankar', role: 'generic' },
  'AI1014': { name: 'Alphonse Jesudoss', role: 'se' },
  'AI1015': { name: 'Vinoth Kumar R', role: 'pm' },
  'AI1016': { name: 'Dharma K', role: 'generic' },
  'AI1017': { name: 'Britto Stalin M', role: 'costing' },
  'AI1018': { name: 'Dharma', role: 'generic' },
  'AI1019': { name: 'Geetha', role: 'generic' },
  'AI1020': { name: 'Prashanth Kumar', role: 'generic' },
  'AI1021': { name: 'Vinoth Kumar', role: 'generic' },
  'AI1022': { name: 'Shanmugam Elumalai', role: 'ops' },
  'AI1023': { name: 'Rozario L', role: 'pm' },
  'AI1024': { name: 'Vivek', role: 'se' },
  'AI1025': { name: 'Pasupathi R', role: 'se' },
  'AI1026': { name: 'Naveen P', role: 'se' },
  'AI1027': { name: 'D J Banerjee', role: 'pm' },
  'AI1028': { name: 'Sakthi Vignesh', role: 'se' },
  'AI1029': { name: 'Muthu Kumar', role: 'pm' },
  'AI1030': { name: 'Harini Jaikumar', role: 'generic' },
  'AI1031': { name: 'Rajendran Athimoolam', role: 'procurement' },
  'AI1032': { name: 'Agathiyan P', role: 'generic' },
  'AI1033': { name: 'Bhakiyaraj', role: 'se' },
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanId = username.trim().toUpperCase();
    const cleanPass = password.trim();

    // Verification logic: All passwords are 123 per requirement
    if (cleanPass !== '123') {
      setError('Invalid PIN. Please use the company default security code.');
      setLoading(false);
      return;
    }

    const staff = STAFF_ROSTER[cleanId];
    if (staff) {
      // Simulate network delay for premium feel
      setTimeout(() => {
        onLogin(staff.role, staff.name, cleanId);
        setLoading(false);
      }, 800);
    } else {
      setError('Employee ID not recognized in our directory.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#1c1c1e] font-inter">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/50 dark:bg-blue-900/10 blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/50 dark:bg-indigo-900/10 blur-[100px]" />

      <GlassCard className="w-full max-w-md relative z-10 shadow-2xl border-white/40">
        <div className="text-center mb-10">
          <img src="https://aaraainfrastructure.com/logo.png" alt="Logo" className="h-16 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AARAA Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Infrastructure Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Employee ID</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-indigo-600 transition-all font-mono font-bold uppercase dark:text-white" 
                placeholder="AI1000" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Login PIN</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:outline-none focus:border-slate-900 dark:focus:border-indigo-600 transition-all font-bold dark:text-white" 
                placeholder="••••" 
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-900/30">
            <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              Use your assigned Employee ID and the default company security PIN to access your personal site dashboard.
            </p>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-red-500 text-[10px] text-center bg-red-50 dark:bg-red-900/10 py-3 rounded-xl font-black uppercase border border-red-100 dark:border-red-900/30 tracking-widest"
            >
              {error}
            </motion.p>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Validating...' : 'Secure Login'}</span>
            <ArrowRight size={18} />
          </motion.button>
        </form>
      </GlassCard>
    </div>
  );
};

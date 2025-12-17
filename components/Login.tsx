import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, User } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Sanitize inputs: remove spaces, convert username to lowercase
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'maha' && cleanPass === '123') {
      onLogin('maha', 'Maha');
    } else if (cleanUser === 'dpr' && cleanPass === '123') {
      onLogin('dpr', 'DPR Viewer');
    } else if (cleanUser === 'finance' && cleanPass === '123') {
      onLogin('finance', 'Accounts Dept');
    } else if (cleanUser === 'procurement' && cleanPass === '123') {
      onLogin('procurement', 'Procurement Team');
    } else if (cleanUser === 'pm' && cleanPass === '123') {
      onLogin('pm', 'Project Manager');
    } else if (cleanUser === 'se' && cleanPass === '123') {
      onLogin('se', 'Site Engineer');
    } else if (cleanUser === 'ai1024' && cleanPass === '123') {
      // Specific login for Vivek
      onLogin('se', 'Vivek');
    } else if (cleanUser === 'ai1029' && cleanPass === '123') {
      // Specific login for Muthu (PM for Waaree)
      onLogin('pm', 'Muthu');
    } else if (cleanUser === 'waaree' && cleanPass === '123') {
      onLogin('waaree', 'Waaree Site Incharge');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[100px]" />

      <GlassCard className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <img 
            src="https://aaraainfrastructure.com/logo.png" 
            alt="Logo" 
            className="h-16 w-auto mx-auto mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-500">Sign in to access the DPR System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aaraa-blue/20 focus:border-aaraa-blue transition-all"
                placeholder="Enter username"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aaraa-blue/20 focus:border-aaraa-blue transition-all"
                placeholder="••••••"
                autoCapitalize="none"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Sign In</span>
            <ArrowRight size={18} />
          </motion.button>
        </form>
      </GlassCard>
    </div>
  );
};
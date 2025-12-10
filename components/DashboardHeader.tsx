import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  userRole: string;
  onLogout: () => void;
  title?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userRole, onLogout, title }) => {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 px-6 py-4 mb-6 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm flex items-center justify-between no-print"
    >
      <div className="flex items-center space-x-4">
        <img 
          src="http://aaraainfrastructure.com/png" 
          alt="Aaraa Logo" 
          className="h-10 w-auto object-contain rounded-md" 
        />
        <div className="hidden md:block">
           <h1 className="text-lg font-bold text-slate-800 tracking-tight">AARAA Infrastructure</h1>
           <p className="text-xs text-slate-500 font-medium">Daily Progress Reporting System</p>
        </div>
      </div>

      {title && (
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        </div>
      )}

      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="flex flex-col items-end mr-2">
          <span className="text-sm font-semibold text-slate-700 font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-xs text-slate-500">
            {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </motion.header>
  );
};

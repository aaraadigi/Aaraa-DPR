import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, LogOut, Bell, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';

interface DashboardHeaderProps {
  userRole: string;
  onLogout: () => void;
  title?: string;
  notifications?: Notification[];
  onClearNotification?: (id: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userRole, 
  onLogout, 
  title,
  notifications = [],
  onClearNotification
}) => {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
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
          src="https://aaraainfrastructure.com/logo.png" 
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
        
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
              >
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 text-sm">Notifications</h3>
                  <span className="text-xs text-slate-400">{notifications.length} Unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm italic">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors relative group">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            n.type === 'success' ? 'bg-green-100 text-green-700' :
                            n.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {n.projectName || 'System'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-snug pr-6">{n.message}</p>
                        
                        {onClearNotification && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearNotification(n.id);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            title="Mark as Read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex flex-col items-end mr-2">
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
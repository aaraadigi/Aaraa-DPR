
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Wallet, ClipboardList, LogOut, User, ListTodo } from 'lucide-react';
import { UserRole } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  userName: string;
  userId: string;
  activeView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, onClose, role, userName, userId, activeView, onNavigate, onLogout 
}) => {
  const menuItems = [
    // Primary item for AI1009 (Daily Task Board)
    { 
      id: 'daily_tasks', 
      label: 'Daily Task', 
      icon: ListTodo, 
      roles: ['maha', 'md'], 
      specificUserId: 'ai1009', 
      primary: true 
    },
    { 
      id: 'petty_cash', 
      label: 'Petty Cash', 
      icon: Wallet, 
      roles: ['all', 'md'], 
      primary: true 
    },
    { 
      id: 'dashboard', 
      label: 'Management Dash', 
      icon: LayoutDashboard, 
      roles: ['all', 'md'] 
    },
    { 
      id: 'dpr_viewer', 
      label: 'Reports Archive', 
      icon: ClipboardList, 
      roles: ['md', 'ops', 'pm', 'finance', 'dpr', 'maha'],
      allowedUserIds: ['ai1029', 'ai1022'] 
    },
  ];

  const filteredItems = menuItems.filter(item => {
    const currentRole = (role || '').toLowerCase();
    const currentUserId = (userId || '').toLowerCase();
    const targetUserId = (item.specificUserId || '').toLowerCase();
    
    if (item.specificUserId) {
      return currentUserId === targetUserId;
    }

    if ((item as any).allowedUserIds?.includes(currentUserId)) {
      return true;
    }

    const roleMatch = item.roles.includes('all') || item.roles.includes(currentRole);
    return roleMatch;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md z-[60]"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-[#1c1c1e] shadow-2xl z-[70] flex flex-col border-r border-slate-100 dark:border-white/5 font-inter transition-colors duration-300"
          >
            <div className="p-8 flex items-center justify-between border-b border-slate-50 dark:border-white/5">
              <img src="https://aaraainfrastructure.com/logo.png" className="h-12 w-auto dark:invert dark:brightness-200" alt="Logo" />
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X size={24} className="text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base truncate w-40 leading-none">{userName}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">{userId || role}</p>
                </div>
              </div>
            </div>

            <nav className="flex-grow px-4 py-8 space-y-2">
              <div className="px-4 mb-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Modules</div>
              {filteredItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all group ${
                      isActive 
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-2xl translate-x-1' 
                      : (item as any).primary 
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-400/10 hover:bg-indigo-100/50 dark:hover:bg-indigo-400/20 mb-4' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={isActive ? 22 : 20} className={isActive ? 'text-indigo-400 dark:text-white' : ''} />
                    <span className={`font-bold text-sm ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-6 mt-auto border-t border-slate-50 dark:border-white/5">
              <button 
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
              >
                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                <span className="font-extrabold text-sm uppercase tracking-wide">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

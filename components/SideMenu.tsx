
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Wallet, ClipboardList, LogOut, User, Settings, CreditCard } from 'lucide-react';
import { UserRole } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  userName: string;
  activeView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, onClose, role, userName, activeView, onNavigate, onLogout 
}) => {
  const menuItems = [
    { id: 'petty_cash', label: 'Petty Cash', icon: Wallet, roles: ['all'], primary: true },
    { id: 'dashboard', label: 'Management Dash', icon: LayoutDashboard, roles: ['all'] },
    { id: 'dpr_viewer', label: 'Reports Archive', icon: ClipboardList, roles: ['md', 'ops', 'pm', 'finance', 'dpr', 'maha'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(role || '')
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[70] flex flex-col border-r border-slate-100 font-inter"
          >
            <div className="p-8 flex items-center justify-between border-b border-slate-50">
              <img src="https://aaraainfrastructure.com/logo.png" className="h-12 w-auto" alt="Logo" />
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="px-8 py-6 bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base truncate w-40 leading-none">{userName}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{role}</p>
                </div>
              </div>
            </div>

            <nav className="flex-grow px-4 py-8 space-y-2">
              <div className="px-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Modules</div>
              {filteredItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all group ${
                      isActive 
                      ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-x-1' 
                      : item.primary 
                        ? 'text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/50 mb-4 font-black' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={isActive ? 22 : 20} className={isActive ? 'text-indigo-400' : ''} />
                    <span className={`font-bold text-sm ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                    {item.primary && !isActive && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                  </button>
                );
              })}
            </nav>

            <div className="p-6 space-y-2 mt-auto border-t border-slate-50">
              <button 
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors group"
              >
                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                <span className="font-extrabold text-sm uppercase tracking-wide">Logout Session</span>
              </button>
              <div className="pt-4 text-center">
                <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">AARAA Enterprise v3.0</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Plus, Trash2, Calendar, 
  LayoutList, Zap, ClipboardCheck, Clock
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabaseClient';
import { DailyTask } from '../types';

interface DailyTaskBoardProps {
  userId: string;
}

export const DailyTaskBoard: React.FC<DailyTaskBoardProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    setLoading(true);
    // Fetch logic: 
    // 1. All PENDING tasks (Carry forward)
    // 2. All tasks created TODAY (Completed or Pending)
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .or(`status.eq.pending,created_at.gte.${todayStr}T00:00:00`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask = {
      description: inputValue.trim(),
      status: 'pending',
      user_id: userId,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert([newTask])
      .select()
      .single();

    if (!error && data) {
      setTasks([data, ...tasks]);
      setInputValue('');
    }
  };

  const setStatus = async (taskId: number, newStatus: 'pending' | 'completed') => {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (!error) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }
  };

  const deleteTask = async (taskId: number) => {
    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Primary Date Heading */}
      <div className="mb-12 text-center md:text-left">
        <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
          <Calendar className="text-indigo-600" size={20} />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Office Work Agenda</span>
        </div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-4 justify-center md:justify-start mt-4">
           <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <Clock size={14} /> {pendingCount} Pending Tasks
           </div>
           <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <CheckCircle2 size={14} /> {tasks.length - pendingCount} Finished
           </div>
        </div>
      </div>

      {/* Task Input Area */}
      <GlassCard className="mb-10 !p-2 border-2 border-indigo-100 shadow-2xl">
        <form onSubmit={addTask} className="flex items-center">
          <div className="flex-grow relative">
            <LayoutList className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
            <input 
              type="text" 
              placeholder="Type office work here... (e.g. Vendor payment, Grocery purchase)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-transparent text-xl font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-30 flex items-center gap-2"
          >
            <Plus size={18} /> Save Task
          </button>
        </form>
      </GlassCard>

      {/* Task List Workspace */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Journal...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 shadow-sm">
             <ClipboardCheck size={64} className="mx-auto text-slate-100 mb-6" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No tasks listed for today</p>
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GlassCard className={`
                  !p-6 flex items-center justify-between group transition-all duration-300
                  ${task.status === 'completed' ? 'bg-slate-50/80 opacity-70 scale-[0.98]' : 'hover:border-indigo-200 hover:shadow-xl'}
                `}>
                  <div className="flex items-center gap-6 flex-grow">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                      ${task.status === 'completed' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400'}
                    `}>
                      {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Zap size={24} />}
                    </div>
                    
                    <div className="flex-grow">
                      <p className={`
                        text-xl font-bold transition-all duration-500
                        ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}
                      `}>
                        {task.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                           {new Date(task.created_at).toLocaleDateString()}
                        </span>
                        {new Date(task.created_at).toDateString() !== new Date().toDateString() && task.status === 'pending' && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2 py-0.5 rounded shadow-sm">
                            Carried Forward
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-6">
                    <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                      <button 
                        onClick={() => setStatus(task.id, 'pending')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${task.status === 'pending' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Pending
                      </button>
                      <button 
                        onClick={() => setStatus(task.id, 'completed')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${task.status === 'completed' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {task.status === 'completed' && <CheckCircle2 size={12} />}
                        Completed
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      title="Delete Task"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

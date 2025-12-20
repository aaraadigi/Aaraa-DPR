
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Camera, Send, Download, Search, X, Image as ImageIcon, CheckCircle2, XCircle, Building2, Clock, AlertCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabaseClient';
import { PROJECTS_DATA } from '../constants';

interface PettyCashEntry {
  id: number;
  timestamp: number;
  date: string;
  user_id: string;
  user_name: string;
  amount: number;
  paid_to: string;
  remarks: string;
  screenshot: string;
  status: 'Pending_PM_Approval' | 'Approved' | 'Rejected';
  project_name?: string;
  pm_comments?: string;
  initiated_by_finance: boolean;
}

interface PettyCashProps {
  role: string;
  userId: string;
  userName: string;
}

type FilterPreset = 'all' | 'day' | 'week' | 'month' | 'year' | 'custom';

export const PettyCash: React.FC<PettyCashProps> = ({ role, userId, userName }) => {
  const [entries, setEntries] = useState<PettyCashEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [filterType, setFilterType] = useState<FilterPreset>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isFinance = userId === 'ai1012';
  const isPM = role === 'pm';

  useEffect(() => {
    fetchEntries();
    const channel = supabase.channel('petty-cash-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'petty_cash' }, () => {
        fetchEntries();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchEntries = async () => {
    const { data } = await supabase.from('petty_cash').select('*').order('id', { ascending: false });
    if (data) setEntries(data);
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !paidTo || !screenshot || (isFinance && !selectedProject)) {
      return alert("All fields including project and screenshot are mandatory.");
    }
    setSubmitting(true);
    
    const { error } = await supabase.from('petty_cash').insert({
      timestamp: Date.now(),
      date: new Date().toISOString(),
      user_id: userId,
      user_name: userName,
      amount: parseFloat(amount),
      paid_to: paidTo,
      remarks,
      screenshot,
      project_name: selectedProject || 'General',
      initiated_by_finance: isFinance,
      status: isFinance ? 'Pending_PM_Approval' : 'Approved'
    });

    if (!error) {
      setShowForm(false);
      setAmount(''); setPaidTo(''); setRemarks(''); setScreenshot(null); setSelectedProject('');
      fetchEntries();
    }
    setSubmitting(false);
  };

  const handlePMAction = async (id: number, action: 'Approved' | 'Rejected') => {
    const comment = prompt(`Enter ${action} reason (optional):`);
    const { error } = await supabase
      .from('petty_cash')
      .update({ status: action, pm_comments: comment })
      .eq('id', id);
    
    if (!error) fetchEntries();
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries;
    if (!isFinance && !isPM) {
      filtered = entries.filter(e => e.user_id === userId);
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.user_name.toLowerCase().includes(s) || 
        e.paid_to.toLowerCase().includes(s) || 
        e.remarks?.toLowerCase().includes(s) ||
        e.project_name?.toLowerCase().includes(s)
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (filterType === 'day') filtered = filtered.filter(e => e.timestamp >= startOfToday);

    return filtered;
  }, [entries, userId, isFinance, isPM, searchTerm, filterType]);

  const pendingApprovals = useMemo(() => 
    entries.filter(e => e.status === 'Pending_PM_Approval' && (isFinance || isPM)),
  [entries, isFinance, isPM]);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 font-inter">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg"><Wallet size={28}/></div>
            Petty Cash Ledger
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {isFinance ? "Finance Disbursement Console (AI1012)" : "Project Expense Tracking"}
          </p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:bg-indigo-700 transition-all"
            >
              <Plus size={20} /> {isFinance ? "Initiate Project Payment" : "New Expense Record"}
            </button>
          )}
        </div>
      </div>

      {/* PM Approval Section */}
      {isPM && pendingApprovals.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertCircle size={16}/> Pending Your Approval
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApprovals.map(entry => (
              <GlassCard key={entry.id} className="border-l-4 border-amber-500 !p-5 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[10px] font-black bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded uppercase">Finance Initiated</div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">₹{entry.amount.toLocaleString()}</span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{entry.paid_to}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{entry.remarks}</p>
                <div className="flex gap-2 border-t dark:border-white/5 pt-3 mt-auto">
                  <button onClick={() => handlePMAction(entry.id, 'Approved')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-green-700">
                    <CheckCircle2 size={12}/> Approve
                  </button>
                  <button onClick={() => handlePMAction(entry.id, 'Rejected')} className="flex-1 bg-white dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors">
                    <XCircle size={12}/> Reject
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Entry Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-10">
            <GlassCard className="!p-8 border-2 border-indigo-100 dark:border-indigo-500/20 shadow-2xl relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20}/></button>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 border-b dark:border-white/5 pb-4 text-center">
                {isFinance ? "Initiate Site Payment" : "Record New Payment"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  {isFinance && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Select Project for PM Approval</label>
                      <select 
                        value={selectedProject} 
                        onChange={e => setSelectedProject(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none dark:text-white transition-colors"
                      >
                        <option value="" className="dark:bg-[#1c1c1e]">Select Project</option>
                        {PROJECTS_DATA.map(p => <option key={p.id} value={p.name} className="dark:bg-[#1c1c1e]">{p.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Amount Paid (₹)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-2xl font-black text-indigo-600 dark:text-indigo-400 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Paid To</label>
                    <input type="text" value={paidTo} onChange={e => setPaidTo(e.target.value)} placeholder="Vendor Name" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none dark:text-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Remarks</label>
                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Purpose of payment..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none dark:text-white transition-colors" rows={3} />
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block text-center">Receipt Upload</label>
                  <label className={`w-full h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-slate-50 dark:bg-white/5 ${screenshot ? 'border-green-500' : 'border-slate-200 dark:border-white/10'}`}>
                    {screenshot ? <img src={screenshot} className="w-full h-full object-cover" /> : (
                      <div className="text-center group">
                        <Camera size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Upload Receipt</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleCapture} />
                  </label>
                  <button onClick={handleSubmit} disabled={submitting} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 transition-all">
                    <Send size={18}/> {submitting ? 'Processing...' : isFinance ? 'Send for PM Approval' : 'Record Expense'}
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#2c2c2e] rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
        <div className="p-6 border-b dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
            {['all', 'day', 'week', 'month'].map(f => (
              <button key={f} onClick={() => setFilterType(f as any)} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${filterType === f ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}>{f}</button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 text-slate-300 dark:text-slate-600" size={16} />
            <input type="text" placeholder="Search entries..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm outline-none dark:text-white transition-colors" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b dark:border-white/5">
              <tr>
                <th className="px-6 py-5">S.No</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Project</th>
                <th className="px-6 py-5">Paid To</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Proof</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(e => (
                <tr key={e.id} className="border-b dark:border-white/5 hover:bg-indigo-50/20 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5 text-[10px] font-black text-slate-300 dark:text-slate-600">#{e.id}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-800 dark:text-slate-300">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-800 dark:text-slate-300">{e.project_name || 'N/A'}</td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{e.paid_to}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{e.user_name}</div>
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white tracking-tight">₹{e.amount.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                      e.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                      e.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                      'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 animate-pulse'
                    }`}>
                      {e.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => {
                        const win = window.open("");
                        win?.document.write(`<html><body style="margin:0;display:flex;justify-content:center;background:#000;"><img src="${e.screenshot}" style="max-width:100%;"/></body></html>`);
                      }}
                      className="p-2 bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <ImageIcon size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
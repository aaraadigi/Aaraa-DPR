
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Camera, Send, Download, Search, X, Image as ImageIcon, CheckCircle2, XCircle, Building2, Clock, AlertCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabaseClient';
import { PROJECTS_DATA } from '../constants';
import { PettyCashEntry } from '../types';

interface PettyCashProps {
  role: string;
  userId: string;
  userName: string;
}

type FilterPreset = 'all' | 'day' | 'week' | 'month';

export const PettyCash: React.FC<PettyCashProps> = ({ role, userId, userName }) => {
  const [entries, setEntries] = useState<PettyCashEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Special IDs for workflow (Case-insensitive comparison)
  const isPM_Mathi = userId.toUpperCase() === 'AI1002';
  const isFinance_Sudha = userId.toUpperCase() === 'AI1012';

  useEffect(() => {
    fetchEntries();
    const channel = supabase.channel('petty-cash-flow')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'petty_cash' }, () => {
        fetchEntries();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await supabase.from('petty_cash').select('*').order('id', { ascending: false });
      if (data) setEntries(data);
    } catch (err) {
      console.error("Petty Cash fetch failed:", err);
    }
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
    if (!amount || !paidTo || !screenshot || !selectedProject) {
      return alert("Project, Amount, Paid To, and Receipt Image are mandatory.");
    }
    setSubmitting(true);
    
    try {
      const { error } = await supabase.from('petty_cash').insert({
        timestamp: Date.now(),
        date: new Date().toISOString(),
        user_id: userId,
        user_name: userName,
        amount: parseFloat(amount),
        paid_to: paidTo,
        remarks,
        screenshot,
        project_name: selectedProject,
        status: 'Pending_PM_Approval'
      });

      if (!error) {
        setShowForm(false);
        setAmount(''); setPaidTo(''); setRemarks(''); setScreenshot(null); setSelectedProject('');
        fetchEntries();
      } else {
        throw error;
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit request.");
    }
    setSubmitting(false);
  };

  const handlePMApproval = async (id: number, action: 'Approved' | 'Rejected') => {
    const nextStatus = action === 'Approved' ? 'Pending_Finance_Disbursement' : 'Rejected';
    const comment = prompt(`Reason for ${action}:`);
    if (comment === null) return;

    try {
      const { error } = await supabase
        .from('petty_cash')
        .update({ status: nextStatus, pm_comments: comment })
        .eq('id', id);
      if (!error) fetchEntries();
      else throw error;
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const handleFinancePayment = async (id: number) => {
    const ref = prompt("Enter UTR / Payment Ref Number:");
    if (!ref) return;

    try {
      const { error } = await supabase
        .from('petty_cash')
        .update({ status: 'Completed', payment_ref: ref })
        .eq('id', id);
      if (!error) fetchEntries();
      else throw error;
    } catch (err) {
      console.error("Payment update failed:", err);
    }
  };

  const exportCSV = () => {
    const headers = "Date,Project,Requested By,Paid To,Amount,Status,Remarks,Payment Ref\n";
    const rows = filteredEntries.map(e => (
      `${new Date(e.date).toLocaleDateString()},${e.project_name},${e.user_name},${e.paid_to},${e.amount},${e.status},"${e.remarks || ''}","${e.payment_ref || ''}"`
    )).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PettyCash_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries;
    // Non-approvers only see their own requests
    if (!isPM_Mathi && !isFinance_Sudha && role !== 'maha' && role !== 'md') {
      filtered = entries.filter(e => e.user_id === userId);
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.user_name.toLowerCase().includes(s) || 
        e.paid_to.toLowerCase().includes(s) || 
        e.project_name?.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [entries, userId, role, isPM_Mathi, isFinance_Sudha, searchTerm]);

  const pmInbox = entries.filter(e => e.status === 'Pending_PM_Approval');
  const financeInbox = entries.filter(e => e.status === 'Pending_Finance_Disbursement');

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 no-print">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Wallet className="text-indigo-600" size={32} /> Petty Cash Flow
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time Financial Accountability</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-white dark:bg-[#2c2c2e] text-slate-700 dark:text-slate-200 border dark:border-white/10 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button onClick={() => window.print()} className="bg-white dark:bg-[#2c2c2e] text-slate-700 dark:text-slate-200 border dark:border-white/10 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
            <Printer size={18} /> PDF
          </button>
          <button onClick={() => setShowForm(true)} className="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
            <Plus size={20} /> New Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {isPM_Mathi && pmInbox.length > 0 && (
          <GlassCard className="border-t-4 border-amber-500">
            <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={16}/> PM Approval Queue ({pmInbox.length})
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {pmInbox.map(e => (
                <div key={e.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border dark:border-white/5 flex justify-between items-center">
                  <div>
                    <p className="font-black text-slate-800 dark:text-white">₹{e.amount} — {e.paid_to}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.user_name} @ {e.project_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePMApproval(e.id, 'Approved')} className="p-2 bg-green-600 text-white rounded-lg hover:scale-110 transition-transform"><CheckCircle2 size={16}/></button>
                    <button onClick={() => handlePMApproval(e.id, 'Rejected')} className="p-2 bg-red-600 text-white rounded-lg hover:scale-110 transition-transform"><XCircle size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {isFinance_Sudha && financeInbox.length > 0 && (
          <GlassCard className="border-t-4 border-blue-500">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={16}/> Finance Payment Queue ({financeInbox.length})
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {financeInbox.map(e => (
                <div key={e.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border dark:border-white/5 flex justify-between items-center">
                  <div>
                    <p className="font-black text-slate-800 dark:text-white">₹{e.amount} — {e.paid_to}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auth: Mathiyazhagan | {e.project_name}</p>
                  </div>
                  <button onClick={() => handleFinancePayment(e.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md">Mark Paid</button>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
            <GlassCard className="!p-8">
              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Petty Cash Request</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X/></button>
              </div>
              <div className="space-y-4">
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-indigo-500 transition-colors">
                  <option value="">Select Project</option>
                  {PROJECTS_DATA.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-2xl text-sm font-black dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                <input type="text" value={paidTo} onChange={e => setPaidTo(e.target.value)} placeholder="Paid To / Vendor Name" className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Purpose of expense..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-2xl text-sm dark:text-white outline-none focus:border-indigo-500 transition-colors" rows={3} />
                <label className="w-full h-40 border-2 border-dashed dark:border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-white/5 overflow-hidden transition-colors hover:border-indigo-400">
                  {screenshot ? <img src={screenshot} className="w-full h-full object-cover"/> : <><Camera className="text-slate-300 mb-2"/><span className="text-xs font-bold text-slate-400">Capture/Upload Receipt</span></>}
                  <input type="file" className="hidden" accept="image/*" onChange={handleCapture} />
                </label>
                <button onClick={handleSubmit} disabled={submitting} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50 hover:bg-slate-800 transition-all">
                  {submitting ? 'Syncing...' : 'Forward for Approval'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <div className="bg-white dark:bg-[#2c2c2e] rounded-[2rem] overflow-hidden shadow-xl border dark:border-white/5">
        <div className="p-6 border-b dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-300" size={16} />
            <input type="text" placeholder="Search entries..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border dark:border-white/10 rounded-xl text-xs font-bold outline-none dark:text-white" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Project</th>
                <th className="px-6 py-5">Initiator</th>
                <th className="px-6 py-5">Paid To</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredEntries.map(e => (
                <tr key={e.id} className="border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5 font-bold text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-5 font-black text-slate-900 dark:text-slate-200">{e.project_name}</td>
                  <td className="px-6 py-5 font-bold text-slate-500">{e.user_name}</td>
                  <td className="px-6 py-5 font-bold text-slate-800 dark:text-slate-300">{e.paid_to}</td>
                  <td className="px-6 py-5 font-black text-slate-900 dark:text-white">₹{e.amount}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-full font-black uppercase text-[8px] tracking-widest ${
                      e.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      e.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {e.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button onClick={() => window.open(e.screenshot)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-indigo-600 hover:scale-110 transition-transform"><ImageIcon size={14}/></button>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

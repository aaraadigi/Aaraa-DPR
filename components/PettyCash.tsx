
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Camera, Send, Download, Calendar, Search, X, Image as ImageIcon, Filter, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabaseClient';

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
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Advanced Filtering
  const [filterType, setFilterType] = useState<FilterPreset>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // AI1012 is the primary Finance Manager for auditing
  const isFinance = userId === 'ai1012';

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
    if (!amount || !paidTo || !screenshot) return alert("All fields are mandatory including GPay screenshot.");
    setSubmitting(true);
    
    const { error } = await supabase.from('petty_cash').insert({
      timestamp: Date.now(),
      date: new Date().toISOString(),
      user_id: userId,
      user_name: userName,
      amount: parseFloat(amount),
      paid_to: paidTo,
      remarks,
      screenshot
    });

    if (!error) {
      setShowForm(false);
      setAmount(''); setPaidTo(''); setRemarks(''); setScreenshot(null);
      fetchEntries();
    }
    setSubmitting(false);
  };

  const filteredEntries = useMemo(() => {
    let filtered = isFinance ? entries : entries.filter(e => e.user_id === userId);

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.user_name.toLowerCase().includes(s) || 
        e.paid_to.toLowerCase().includes(s) || 
        e.remarks?.toLowerCase().includes(s)
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    if (filterType === 'day') {
      filtered = filtered.filter(e => e.timestamp >= startOfToday);
    } else if (filterType === 'week') {
      const lastWeek = now.getTime() - (7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => e.timestamp >= lastWeek);
    } else if (filterType === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      filtered = filtered.filter(e => e.timestamp >= startOfMonth);
    } else if (filterType === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
      filtered = filtered.filter(e => e.timestamp >= startOfYear);
    } else if (filterType === 'custom' && dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start).getTime();
      const end = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => e.timestamp >= start && e.timestamp <= end);
    }

    return filtered;
  }, [entries, userId, isFinance, searchTerm, filterType, dateRange]);

  const exportCSV = () => {
    const headers = "Serial No,Date,Time,User,UserID,Paid To,Amount,Remarks\n";
    const rows = filteredEntries.map(e => {
      const dt = new Date(e.date);
      return `${e.id},${dt.toLocaleDateString()},${dt.toLocaleTimeString()},${e.user_name},${e.user_id},${e.amount},${e.paid_to},"${e.remarks || ''}"`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PettyCash_${filterType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 font-inter">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200"><Wallet size={28}/></div>
            Petty Cash Ledger
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Recorded payments monitored by AI1012 (Finance Manager).</p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-200 flex items-center gap-2 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
            >
              <Plus size={20} /> New Expense Record
            </button>
          )}
          {isFinance && (
            <button onClick={exportCSV} className="bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Download size={20} /> Export Report
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-10">
            <GlassCard className="!p-8 border-2 border-indigo-100 shadow-2xl relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={20}/></button>
              <h3 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4 text-center">Record GPay Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount Paid (₹)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-indigo-600 focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Paid To (Vendor/Person)</label>
                    <input type="text" value={paidTo} onChange={e => setPaidTo(e.target.value)} placeholder="Name of vendor" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Remarks</label>
                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Reason for payment..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all" rows={3} />
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">GPay Screenshot (Proof of Payment)</label>
                  <label className={`w-full h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-slate-50 ${screenshot ? 'border-green-500 bg-green-50/10' : 'border-slate-200 hover:border-indigo-500 hover:bg-white'}`}>
                    {screenshot ? (
                      <img src={screenshot} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center group">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-indigo-500 shadow-sm transition-all"><Camera size={32} /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click to Capture Screenshot</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleCapture} />
                  </label>
                  <button onClick={handleSubmit} disabled={submitting} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 disabled:opacity-50 shadow-xl transition-all">
                    <Send size={18}/> {submitting ? 'Recording...' : 'Submit to AI1012 (Finance)'}
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['all', 'day', 'week', 'month', 'year', 'custom'] as FilterPreset[]).map(f => (
              <button 
                key={f} 
                onClick={() => setFilterType(f)} 
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 flex-grow md:justify-end">
            {filterType === 'custom' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="text-[10px] font-bold p-1.5 border rounded-lg focus:outline-none focus:border-indigo-500" />
                <span className="text-slate-300">-</span>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="text-[10px] font-bold p-1.5 border rounded-lg focus:outline-none focus:border-indigo-500" />
              </div>
            )}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-300" size={16} />
              <input type="text" placeholder="Search entries..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5">S.No</th>
                <th className="px-6 py-5">Date & Time</th>
                <th className="px-6 py-5">Employee</th>
                <th className="px-6 py-5">Paid To</th>
                <th className="px-6 py-5 text-right">Amount</th>
                <th className="px-6 py-5 text-center">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((e, idx) => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-5 text-[10px] font-black text-slate-300 group-hover:text-indigo-600">#{e.id}</td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-slate-800">{new Date(e.date).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{new Date(e.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-slate-800">{e.user_name}</div>
                    <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-tighter">{e.user_id}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-slate-800">{e.paid_to}</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{e.remarks}</div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="text-sm font-black text-slate-900 tracking-tight">₹{e.amount.toLocaleString('en-IN')}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => {
                        const win = window.open("");
                        win?.document.write(`
                          <html><head><title>Payment Proof #${e.id}</title></head>
                          <body style="margin:0; background:#0f172a; display:flex; justify-content:center; align-items:center; min-height:100vh; font-family:sans-serif;">
                            <div style="max-width:400px; padding:20px; background:white; border-radius:20px; text-align:center;">
                              <h3 style="margin-top:0;">Payment Receipt #${e.id}</h3>
                              <p style="color:#64748b; font-size:12px;">Paid to ${e.paid_to} by ${e.user_name}</p>
                              <img src="${e.screenshot}" style="width:100%; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:15px;" />
                              <button onclick="window.close()" style="padding:10px 20px; background:#000; color:#fff; border-radius:10px; border:none; cursor:pointer; font-weight:bold;">Close Preview</button>
                            </div>
                          </body></html>
                        `);
                      }}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm mx-auto flex items-center justify-center"
                      title="View Screenshot"
                    >
                      <ImageIcon size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200"><Wallet size={32}/></div>
              <p className="text-slate-400 font-medium text-sm">No records available for the selected period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

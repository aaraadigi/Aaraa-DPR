
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Trash2, Send, Building2, Calendar, Camera, X } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest, RequestItem } from '../types';
import { MATERIAL_INDENT_SUGGESTIONS } from '../constants';

interface MaterialRequestFormProps {
  projectName?: string;
  userName?: string;
  onSave: (data: MaterialRequest) => void;
  onCancel: () => void;
}

export const MaterialRequestForm: React.FC<MaterialRequestFormProps> = ({ projectName, userName, onSave, onCancel }) => {
  const [items, setItems] = useState<RequestItem[]>([{ material: '', quantity: 0, unit: '' }]);
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [deadline, setDeadline] = useState('');
  const [indentPhoto, setIndentPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const updateItem = (index: number, field: keyof RequestItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { material: '', quantity: 0, unit: '' }]);
  const removeItem = (idx: number) => items.length > 1 && setItems(items.filter((_, i) => i !== idx));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIndentPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const validItems = items.filter(i => i.material.trim() !== '' && i.quantity > 0);
    if (validItems.length === 0) return alert("Add at least one item.");
    if (!deadline) return alert("Select a deadline.");

    const newRequest: MaterialRequest = {
      id: `req-${Date.now()}`,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      requestedBy: userName || 'Site Engineer',
      projectName: projectName || 'Unknown Project',
      items: validItems,
      urgency,
      deadline,
      indentSheetPhoto: indentPhoto || undefined,
      status: 'PM_Review', 
      notes
    };
    onSave(newRequest);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <GlassCard>
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Package size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">New Material Indent</h2>
              <p className="text-sm text-slate-500 font-medium">Step 1: Initiation by {userName}</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">
            {projectName}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Items</label>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input list="material-suggestions-list" placeholder="Material" value={item.material} onChange={e => updateItem(idx, 'material', e.target.value)} className="flex-1 bg-transparent text-sm font-bold outline-none" />
                  <input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value))} className="w-16 bg-white border rounded p-1 text-sm font-bold" />
                  <input type="text" placeholder="Unit" value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} className="w-12 bg-white border rounded p-1 text-sm font-bold" />
                  <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="text-sm font-bold text-indigo-600">+ Add Item</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Required Deadline</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Indent Sheet Photo</label>
              <label className="w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50">
                {indentPhoto ? <img src={indentPhoto} className="w-full h-full object-cover" /> : <Camera size={24} className="text-slate-300" />}
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Urgency</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['Low', 'Medium', 'High'].map(l => (
                  <button key={l} onClick={() => setUrgency(l as any)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${urgency === l ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-8 pt-6 border-t">
          <button onClick={onCancel} className="flex-1 py-3 bg-white border rounded-xl font-bold">Cancel</button>
          <button onClick={handleSubmit} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold">Submit to PM</button>
        </div>

        <datalist id="material-suggestions-list">
          {MATERIAL_INDENT_SUGGESTIONS.map((s, i) => <option key={i} value={s} />)}
        </datalist>
      </GlassCard>
    </div>
  );
};

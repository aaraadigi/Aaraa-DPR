import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Trash2, Send, Building2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { MaterialRequest, RequestItem } from '../types';
import { MATERIAL_INDENT_SUGGESTIONS } from '../constants';

interface MaterialRequestFormProps {
  projectName?: string;
  onSave: (data: MaterialRequest) => void;
  onCancel: () => void;
}

export const MaterialRequestForm: React.FC<MaterialRequestFormProps> = ({ projectName, onSave, onCancel }) => {
  const [items, setItems] = useState<RequestItem[]>([
    { material: '', quantity: 0, unit: '' }
  ]);
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [notes, setNotes] = useState('');

  const updateItem = (index: number, field: keyof RequestItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { material: '', quantity: 0, unit: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleSubmit = () => {
    const validItems = items.filter(i => i.material.trim() !== '' && i.quantity > 0);
    
    if (validItems.length === 0) {
      alert("Please add at least one valid material.");
      return;
    }

    const newRequest: MaterialRequest = {
      id: `req-${Date.now()}`,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      requestedBy: 'Site Engineer',
      projectName: projectName || 'Unknown Project',
      items: validItems,
      urgency,
      // Fix: Use a valid IndentStatus. 'PM_Review' corresponds to Step 2 where the indent is sent for initial verification.
      status: 'PM_Review', 
      notes
    };
    onSave(newRequest);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <GlassCard>
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">New Material Indent</h2>
              <p className="text-sm text-slate-500">Step 1: Raise request for PM Review.</p>
            </div>
          </div>
          {projectName && (
            <div className="px-3 py-1 bg-slate-100 rounded-lg flex items-center text-xs font-bold text-slate-600">
              <Building2 size={14} className="mr-2" />
              {projectName}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Items List */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Materials</label>
            {items.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 p-3 rounded-xl border border-slate-100 group"
              >
                <div className="flex-grow w-full md:w-auto">
                  <input 
                    type="text" 
                    list="material-suggestions-list"
                    placeholder="Material Name (e.g. Cement)" 
                    value={item.material}
                    onChange={(e) => updateItem(idx, 'material', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                  <input 
                    type="number" 
                    placeholder="Qty" 
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value))}
                    className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Unit" 
                    value={item.unit}
                    onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                    className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button 
                  onClick={() => removeItem(idx)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
            <button 
              onClick={addItem}
              className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1"
            >
              <Plus size={16} />
              <span>Add Another Item</span>
            </button>
          </div>

          {/* Urgency & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Urgency Level</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['Low', 'Medium', 'High'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setUrgency(level)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      urgency === level 
                        ? level === 'High' ? 'bg-red-500 text-white shadow-md' 
                        : level === 'Medium' ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-green-500 text-white shadow-md'
                        : 'text-slate-500 hover:bg-white/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Additional Notes</label>
               <textarea 
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 placeholder="Specific brands, delivery time, etc."
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                 rows={3}
               />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6 border-t border-slate-100 mt-6">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center space-x-2 hover:bg-slate-800"
            >
              <Send size={18} />
              <span>Submit Request</span>
            </motion.button>
          </div>
        </div>

        {/* Datalist for Auto-Suggestions */}
        <datalist id="material-suggestions-list">
          {MATERIAL_INDENT_SUGGESTIONS.map((suggestion, index) => (
            <option key={index} value={suggestion} />
          ))}
        </datalist>
      </GlassCard>
    </div>
  );
};

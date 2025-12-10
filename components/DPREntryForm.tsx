import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle, HardHat, Hammer, Truck, ShieldAlert } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { LABOUR_CATEGORIES, MATERIAL_TYPES } from '../constants';
import { DPRRecord, LabourEntry, MaterialEntry, ActivityEntry } from '../types';

interface DPREntryFormProps {
  onSave: (data: DPRRecord) => void;
}

export const DPREntryForm: React.FC<DPREntryFormProps> = ({ onSave }) => {
  const [step, setStep] = useState(1);
  const [labour, setLabour] = useState<LabourEntry[]>(
    LABOUR_CATEGORIES.map(cat => ({ category: cat, count: 0, names: '' }))
  );
  const [materials, setMaterials] = useState<MaterialEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([
    { id: '1', description: '', unit: '', plannedQty: 0, executedQty: 0 }
  ]);
  const [machinery, setMachinery] = useState('');
  const [safety, setSafety] = useState('');
  const [risks, setRisks] = useState('');

  // Helpers
  const updateLabour = (index: number, val: number) => {
    const newLabour = [...labour];
    newLabour[index].count = Math.max(0, val);
    // If count becomes 0, optionally clear names, or keep them. keeping them for now is safer.
    setLabour(newLabour);
  };

  const updateLabourNames = (index: number, val: string) => {
    const newLabour = [...labour];
    newLabour[index].names = val;
    setLabour(newLabour);
  };

  const addActivity = () => {
    setActivities([...activities, { id: Date.now().toString(), description: '', unit: '', plannedQty: 0, executedQty: 0 }]);
  };

  const updateActivity = (index: number, field: keyof ActivityEntry, value: string | number) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setActivities(newActivities);
  };

  const toggleMaterial = (matName: string, unit: string) => {
    const exists = materials.find(m => m.name === matName);
    if (exists) {
      setMaterials(materials.filter(m => m.name !== matName));
    } else {
      setMaterials([...materials, { name: matName, unit, quantity: 0 }]);
    }
  };

  const updateMaterialQty = (name: string, qty: number) => {
    setMaterials(materials.map(m => m.name === name ? { ...m, quantity: Math.max(0, qty) } : m));
  };

  const handleSubmit = () => {
    const newRecord: DPRRecord = {
      id: `dpr-${Date.now()}`,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      submittedBy: 'maha',
      labour: labour.filter(l => l.count > 0),
      materials: materials.filter(m => m.quantity > 0),
      activities: activities.filter(a => a.description.trim() !== ''),
      machinery,
      safetyObservations: safety,
      risksAndDelays: risks
    };
    onSave(newRecord);
  };

  const tabs = [
    { id: 1, label: 'Labour', icon: HardHat },
    { id: 2, label: 'Activity', icon: Hammer },
    { id: 3, label: 'Material', icon: Truck },
    { id: 4, label: 'Safety', icon: ShieldAlert },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = step === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStep(tab.id)}
              className={`
                flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${isActive 
                  ? 'bg-slate-800 text-white shadow-lg' 
                  : 'bg-white text-slate-500 hover:bg-slate-100'
                }
              `}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <HardHat className="mr-2 text-aaraa-blue" />
                  Manpower Distribution
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {labour.map((item, idx) => (
                    <div key={item.category} className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all duration-300">
                      <label className="block text-sm font-medium text-slate-600 mb-2">{item.category}</label>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => updateLabour(idx, item.count - 1)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                        >-</button>
                        <input
                          type="number"
                          value={item.count}
                          onChange={(e) => updateLabour(idx, parseInt(e.target.value) || 0)}
                          className="w-20 text-center bg-transparent font-bold text-xl text-slate-800 focus:outline-none"
                        />
                        <button 
                          onClick={() => updateLabour(idx, item.count + 1)}
                          className="w-8 h-8 rounded-full bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/30"
                        >+</button>
                      </div>
                      
                      <AnimatePresence>
                        {item.count > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <textarea
                              placeholder={`Enter names for ${item.category}...`}
                              value={item.names || ''}
                              onChange={(e) => updateLabourNames(idx, e.target.value)}
                              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aaraa-blue/20 focus:border-aaraa-blue resize-none text-slate-700"
                              rows={2}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Hammer className="mr-2 text-aaraa-blue" />
                  Site Activities
                </h3>
                {activities.map((act, idx) => (
                  <div key={act.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                    <div className="md:col-span-5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Activity Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Excavation"
                        value={act.description}
                        onChange={(e) => updateActivity(idx, 'description', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-aaraa-blue focus:outline-none py-1 text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Unit</label>
                       <select 
                         value={act.unit}
                         onChange={(e) => updateActivity(idx, 'unit', e.target.value)}
                         className="w-full bg-transparent border-b border-slate-200 focus:border-aaraa-blue focus:outline-none py-1 text-slate-800"
                       >
                         <option value="">Select</option>
                         <option value="cum">cum</option>
                         <option value="sqm">sqm</option>
                         <option value="rm">rm</option>
                         <option value="nos">nos</option>
                       </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Planned</label>
                      <input 
                        type="number" 
                        value={act.plannedQty || ''}
                        onChange={(e) => updateActivity(idx, 'plannedQty', parseFloat(e.target.value))}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-aaraa-blue focus:outline-none py-1 text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Executed</label>
                      <input 
                        type="number" 
                        value={act.executedQty || ''}
                        onChange={(e) => updateActivity(idx, 'executedQty', parseFloat(e.target.value))}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-aaraa-blue focus:outline-none py-1 text-slate-800"
                      />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={addActivity}
                  className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  + Add Another Activity
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Truck className="mr-2 text-aaraa-blue" />
                  Materials Consumed
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {MATERIAL_TYPES.map(mat => {
                    const isSelected = materials.some(m => m.name === mat.name);
                    return (
                      <button
                        key={mat.name}
                        onClick={() => toggleMaterial(mat.name, mat.unit)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected 
                          ? 'bg-slate-800 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {mat.name}
                      </button>
                    )
                  })}
                </div>
                
                <div className="space-y-4">
                  {materials.map(mat => (
                    <motion.div 
                      key={mat.name}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm"
                    >
                      <span className="font-medium text-slate-700">{mat.name}</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={mat.quantity || ''}
                          onChange={(e) => updateMaterialQty(mat.name, parseFloat(e.target.value))}
                          className="w-24 text-right border-b border-slate-200 focus:border-aaraa-blue outline-none py-1"
                        />
                        <span className="text-sm text-slate-400 w-10">{mat.unit}</span>
                      </div>
                    </motion.div>
                  ))}
                  {materials.length === 0 && (
                    <p className="text-center text-slate-400 py-8 italic">Select materials above to log consumption.</p>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Machinery Used</label>
                  <textarea 
                    value={machinery}
                    onChange={(e) => setMachinery(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-aaraa-blue/20 text-slate-700"
                    placeholder="e.g. JCB, Crane, Vibrator..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <ShieldAlert className="mr-2 text-aaraa-blue" />
                  Safety & Risks
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Safety Observations</label>
                  <textarea 
                    value={safety}
                    onChange={(e) => setSafety(e.target.value)}
                    className="w-full p-4 rounded-xl bg-green-50/50 border border-green-100 focus:ring-2 focus:ring-green-500/20 text-slate-700"
                    placeholder="Any safety incidents or compliance notes..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                    <AlertCircle size={16} className="text-red-500 mr-2" />
                    Risks, Issues & Delays
                  </label>
                  <textarea 
                    value={risks}
                    onChange={(e) => setRisks(e.target.value)}
                    className="w-full p-4 rounded-xl bg-red-50/50 border border-red-100 focus:ring-2 focus:ring-red-500/20 text-slate-700"
                    placeholder="Rain delay, material shortage, equipment failure..."
                    rows={3}
                  />
                </div>

                <div className="pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-aaraa-blue to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
                  >
                    <Save size={20} />
                    <span>Submit Daily Report</span>
                  </motion.button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button 
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className={`px-6 py-2 rounded-full text-slate-500 hover:bg-white transition-colors ${step === 1 ? 'opacity-0' : 'opacity-100'}`}
        >
          Back
        </button>
        {step < 4 && (
          <button 
            onClick={() => setStep(Math.min(4, step + 1))}
            className="px-6 py-2 rounded-full bg-slate-800 text-white shadow-md hover:bg-slate-700 transition-colors"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
};
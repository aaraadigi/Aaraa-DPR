
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, AlertCircle, HardHat, Hammer, Truck, ShieldAlert, Plus, X, 
  Building2, Camera, Image as ImageIcon, CheckCircle2, Loader2, ArrowRight, Clock, PlusCircle, Trash2
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { LABOUR_CATEGORIES, MATERIAL_TYPES } from '../constants';
import { DPRRecord, LabourEntry, MaterialEntry, ActivityEntry } from '../types';

interface DPREntryFormProps {
  onSave: (data: DPRRecord) => void;
  defaultProjectName?: string;
  submittedBy?: string;
}

interface FormLabourEntry extends LabourEntry {
  isCustom?: boolean;
}

export const DPREntryForm: React.FC<DPREntryFormProps> = ({ onSave, defaultProjectName, submittedBy }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedTime, setSubmittedTime] = useState('');
  
  const [labour, setLabour] = useState<FormLabourEntry[]>(
    LABOUR_CATEGORIES.map(cat => ({ category: cat, count: 0, names: '' }))
  );
  const [materials, setMaterials] = useState<MaterialEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([
    { id: '1', description: '', unit: '', plannedQty: 0, executedQty: 0 }
  ]);
  const [machinery, setMachinery] = useState('');
  const [safety, setSafety] = useState('');
  const [risks, setRisks] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // New Material Input State
  const [newMatName, setNewMatName] = useState('');
  const [newMatUnit, setNewMatUnit] = useState('');

  const updateLabour = (index: number, val: number) => {
    const newLabour = [...labour];
    newLabour[index].count = Math.max(0, val);
    setLabour(newLabour);
  };

  const updateLabourNames = (index: number, val: string) => {
    const newLabour = [...labour];
    newLabour[index].names = val;
    setLabour(newLabour);
  };

  const updateLabourCategory = (index: number, val: string) => {
    const newLabour = [...labour];
    newLabour[index].category = val;
    setLabour(newLabour);
  };

  const addLabourRow = () => {
    setLabour([...labour, { category: '', count: 0, names: '', isCustom: true }]);
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

  const addCustomMaterial = () => {
    if (!newMatName.trim() || !newMatUnit.trim()) {
      alert("Please enter both material name and unit.");
      return;
    }
    const exists = materials.find(m => m.name.toLowerCase() === newMatName.toLowerCase());
    if (exists) {
      alert("Material already added.");
      return;
    }
    setMaterials([...materials, { name: newMatName, unit: newMatUnit, quantity: 0 }]);
    setNewMatName('');
    setNewMatUnit('');
  };

  const removeMaterial = (name: string) => {
    setMaterials(materials.filter(m => m.name !== name));
  };

  const updateMaterialQty = (name: string, qty: number) => {
    setMaterials(materials.map(m => m.name === name ? { ...m, quantity: Math.max(0, qty) } : m));
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (photos.length + files.length > 5) {
        alert("Maximum 5 photos allowed.");
        return;
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const now = new Date();
    const newRecord: DPRRecord = {
      id: `dpr-${Date.now()}`,
      date: now.toISOString(),
      timestamp: now.getTime(),
      submittedBy: submittedBy || 'Unknown User',
      projectName: defaultProjectName || 'Unknown Project',
      labour: labour
        .filter(l => l.count > 0 && l.category.trim() !== '')
        .map(({ category, count, names }) => ({ category, count, names })),
      materials: materials.filter(m => m.quantity > 0),
      activities: activities.filter(a => a.description.trim() !== ''),
      machinery,
      safetyObservations: safety,
      risksAndDelays: risks,
      photos
    };

    try {
      await onSave(newRecord);
      setSubmittedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-[#1c1c1e] rounded-[3rem] p-12 shadow-2xl border border-green-100 dark:border-green-900/30 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-500/20">
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle2 size={48} className="text-white" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Report Submitted</h2>
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">
            <Clock size={12} /> Logged at {submittedTime}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
            Your daily progress report for <span className="text-slate-900 dark:text-white font-bold">{defaultProjectName}</span> has been securely saved and synced.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-blue-700 transition-all"
          >
            Finish & Continue <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 1, label: 'Labour', icon: HardHat },
    { id: 2, label: 'Activity', icon: Hammer },
    { id: 3, label: 'Material', icon: Truck },
    { id: 4, label: 'Safety', icon: ShieldAlert },
    { id: 5, label: 'Photos', icon: Camera },
  ];

  const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
  const labelClasses = "text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block";

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-center mb-6">
         <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
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
                  ? 'bg-slate-800 dark:bg-blue-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-[#2c2c2e] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#3a3a3c]'
                }
              `}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {defaultProjectName && (
        <div className="hidden md:flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#2c2c2e] px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-white/5">
          <Building2 size={14} className="mr-2" />
          {defaultProjectName}
        </div>
      )}
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
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <HardHat className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Manpower Distribution
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {labour.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 transition-all duration-300 relative group">
                      <div className="flex justify-between items-start mb-2 h-8">
                        {item.isCustom ? (
                          <input 
                            type="text" 
                            placeholder="Role Name" 
                            value={item.category}
                            onChange={(e) => updateLabourCategory(idx, e.target.value)}
                            className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2 focus:border-indigo-600 focus:outline-none text-sm font-bold text-slate-900 dark:text-white w-full mr-2 pb-1"
                            autoFocus
                          />
                        ) : (
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 pt-1">{item.category}</label>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <button onClick={() => updateLabour(idx, item.count - 1)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center">-</button>
                        <input type="number" value={item.count} onChange={(e) => updateLabour(idx, parseInt(e.target.value) || 0)} className="w-20 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 font-bold text-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                        <button onClick={() => updateLabour(idx, item.count + 1)} className="w-8 h-8 rounded-full bg-slate-800 dark:bg-blue-600 text-white hover:bg-slate-700 dark:hover:bg-blue-500 flex items-center justify-center shadow-lg">+</button>
                      </div>
                      {item.count > 0 && (
                        <textarea
                          placeholder={`Names for ${item.category || 'this role'}...`}
                          value={item.names || ''}
                          onChange={(e) => updateLabourNames(idx, e.target.value)}
                          className="w-full text-xs p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 mt-3 text-slate-900 dark:text-slate-100"
                          rows={2}
                        />
                      )}
                    </div>
                  ))}
                  <button onClick={addLabourRow} className="flex flex-col items-center justify-center min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all duration-300">
                    <Plus size={20} />
                    <span className="text-sm font-medium">Add Other Worker</span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <Hammer className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Site Activities
                </h3>
                {activities.map((act, idx) => (
                  <div key={act.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 relative group">
                    <div className="md:col-span-5">
                      <label className={labelClasses}>Activity Name</label>
                      <input type="text" placeholder="e.g. Excavation" value={act.description} onChange={(e) => updateActivity(idx, 'description', e.target.value)} className={inputClasses} />
                    </div>
                    <div className="md:col-span-2">
                       <label className={labelClasses}>Unit</label>
                       <select value={act.unit} onChange={(e) => updateActivity(idx, 'unit', e.target.value)} className={inputClasses}>
                         <option value="" className="dark:bg-slate-900">Select</option>
                         <option value="cum" className="dark:bg-slate-900">cum</option>
                         <option value="sqm" className="dark:bg-slate-900">sqm</option>
                         <option value="rm" className="dark:bg-slate-900">rm</option>
                         <option value="nos" className="dark:bg-slate-900">nos</option>
                       </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Planned</label>
                      <input type="number" value={act.plannedQty || ''} onChange={(e) => updateActivity(idx, 'plannedQty', parseFloat(e.target.value))} className={inputClasses} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Executed</label>
                      <input type="number" value={act.executedQty || ''} onChange={(e) => updateActivity(idx, 'executedQty', parseFloat(e.target.value))} className={inputClasses} />
                    </div>
                  </div>
                ))}
                <button onClick={addActivity} className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  + Add Another Activity
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <Truck className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Materials Consumed
                </h3>
                
                {/* suggested Material Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {MATERIAL_TYPES.map(mat => (
                    <button 
                      key={mat.name} 
                      onClick={() => toggleMaterial(mat.name, mat.unit)} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${materials.some(m => m.name === mat.name) ? 'bg-slate-800 dark:bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                    >
                      {mat.name}
                    </button>
                  ))}
                </div>

                {/* Custom Material Addition Section */}
                <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5 mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Add New Material</p>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6">
                      <label className={labelClasses}>Material Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Binding Wire" 
                        value={newMatName}
                        onChange={(e) => setNewMatName(e.target.value)}
                        className={inputClasses} 
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className={labelClasses}>Unit</label>
                      <input 
                        type="text" 
                        placeholder="e.g. kg" 
                        value={newMatUnit}
                        onChange={(e) => setNewMatUnit(e.target.value)}
                        className={inputClasses} 
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button 
                        onClick={addCustomMaterial}
                        className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                      >
                        <PlusCircle size={18} /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Consumption Quantities</p>
                  {materials.map(mat => (
                    <div key={mat.name} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl shadow-sm group">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{mat.name}</span>
                        {/* Only show delete for materials that aren't in the default suggested list */}
                        {!MATERIAL_TYPES.find(m => m.name === mat.name) && (
                          <button onClick={() => removeMaterial(mat.name)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={mat.quantity || ''} 
                          onChange={(e) => updateMaterialQty(mat.name, parseFloat(e.target.value))} 
                          className="w-24 text-right outline-none py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold" 
                        />
                        <span className="text-sm text-slate-400 dark:text-slate-500 w-10 text-right">{mat.unit}</span>
                      </div>
                    </div>
                  ))}
                  {materials.length === 0 && (
                    <div className="text-center py-10 text-slate-400 italic text-sm">
                      No materials selected. Select from above or add a new one.
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t dark:border-white/5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Machinery Used</label>
                  <textarea value={machinery} onChange={(e) => setMachinery(e.target.value)} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:outline-none" placeholder="e.g. JCB, Crane, Vibrator..." rows={2} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <ShieldAlert className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Safety & Risks
                </h3>
                <div>
                  <label className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest mb-2 block">Safety Observations</label>
                  <textarea value={safety} onChange={(e) => setSafety(e.target.value)} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-green-200 dark:border-green-900/30 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/10 focus:outline-none" placeholder="Safety compliance notes..." rows={3} />
                </div>
                <div>
                  <label className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-2 block">Risks & Delays</label>
                  <textarea value={risks} onChange={(e) => setRisks(e.target.value)} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/10 focus:outline-none" placeholder="Rain delay, material shortage..." rows={3} />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <Camera className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Site Photos
                </h3>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-white/5">
                   <input type="file" id="photo-upload" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                   <label htmlFor="photo-upload" className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-full font-bold cursor-pointer hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors inline-block">Select Files</label>
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        <img src={photo} className="w-full h-full object-cover" />
                        <button onClick={() => setPhotos(photos.filter((_, i) => i !== index))} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-6 border-t dark:border-white/5 mt-6">
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-blue-600 dark:to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {isSubmitting ? 'Syncing...' : 'Submit Daily Report'}
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className={`px-6 py-2 rounded-full font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>Back</button>
        {step < 5 && <button onClick={() => setStep(Math.min(5, step + 1))} className="px-6 py-2 rounded-full bg-slate-800 dark:bg-blue-600 text-white font-bold hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors">Next Step</button>}
      </div>
    </div>
  );
};

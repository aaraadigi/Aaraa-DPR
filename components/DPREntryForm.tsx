import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle, HardHat, Hammer, Truck, ShieldAlert, Plus, X, Building2, Camera, Image as ImageIcon } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { LABOUR_CATEGORIES, MATERIAL_TYPES } from '../constants';
import { DPRRecord, LabourEntry, MaterialEntry, ActivityEntry } from '../types';

interface DPREntryFormProps {
  onSave: (data: DPRRecord) => void;
  defaultProjectName?: string;
}

// Extend LabourEntry locally to track custom rows
interface FormLabourEntry extends LabourEntry {
  isCustom?: boolean;
}

export const DPREntryForm: React.FC<DPREntryFormProps> = ({ onSave, defaultProjectName }) => {
  const [step, setStep] = useState(1);
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
  
  // Custom Material State
  const [customMatName, setCustomMatName] = useState('');
  const [customMatUnit, setCustomMatUnit] = useState('');

  // Helpers
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

  const removeLabourRow = (index: number) => {
    const newLabour = [...labour];
    newLabour.splice(index, 1);
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
  
  const removeMaterial = (name: string) => {
    setMaterials(materials.filter(m => m.name !== name));
  };

  const addCustomMaterial = () => {
    if (customMatName.trim() && customMatUnit.trim()) {
      // Check if exists
      if (materials.some(m => m.name.toLowerCase() === customMatName.trim().toLowerCase())) {
        alert('Material already added');
        return;
      }
      setMaterials([...materials, { name: customMatName.trim(), unit: customMatUnit.trim(), quantity: 0 }]);
      setCustomMatName('');
      setCustomMatUnit('');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (photos.length + files.length > 5) {
        alert("You can only upload a maximum of 5 photos.");
        return;
      }
      
      // Changed from Array.from(files).forEach to for-loop to fix TS inference issue with FileList
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

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const newRecord: DPRRecord = {
      id: `dpr-${Date.now()}`,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      submittedBy: defaultProjectName ? 'Waaree Site Incharge' : 'maha',
      projectName: defaultProjectName,
      // Filter out empty categories and sanitize the object (remove isCustom)
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
    onSave(newRecord);
  };

  const tabs = [
    { id: 1, label: 'Labour', icon: HardHat },
    { id: 2, label: 'Activity', icon: Hammer },
    { id: 3, label: 'Material', icon: Truck },
    { id: 4, label: 'Safety', icon: ShieldAlert },
    { id: 5, label: 'Photos', icon: Camera },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
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
      {defaultProjectName && (
        <div className="hidden md:flex items-center text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
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
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <HardHat className="mr-2 text-aaraa-blue" />
                  Manpower Distribution
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {labour.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all duration-300 relative group">
                      <div className="flex justify-between items-start mb-2 h-8">
                        {item.isCustom ? (
                          <input 
                            type="text" 
                            placeholder="Role Name" 
                            value={item.category}
                            onChange={(e) => updateLabourCategory(idx, e.target.value)}
                            className="bg-transparent border-b border-slate-300 focus:border-aaraa-blue focus:outline-none text-sm font-bold text-slate-700 w-full mr-2 pb-1"
                            autoFocus
                          />
                        ) : (
                          <label className="block text-sm font-medium text-slate-600 pt-1">{item.category}</label>
                        )}
                        {item.isCustom && (
                          <button 
                            onClick={() => removeLabourRow(idx)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

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
                              placeholder={`Names for ${item.category || 'this role'}...`}
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
                  
                  {/* Add Other Button */}
                  <button 
                    onClick={addLabourRow}
                    className="flex flex-col items-center justify-center min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-aaraa-blue hover:text-aaraa-blue hover:bg-blue-50/50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center mb-2 transition-colors shadow-sm">
                      <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium">Add Other Worker</span>
                  </button>
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
                
                {/* Predefined Chips */}
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
                
                {/* Custom Material Input */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-dashed border-slate-300 mb-6">
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Add Other Material</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Material Name"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-aaraa-blue"
                      value={customMatName}
                      onChange={e => setCustomMatName(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Unit (e.g. Ltrs)"
                      className="w-28 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-aaraa-blue"
                      value={customMatUnit}
                      onChange={e => setCustomMatUnit(e.target.value)}
                    />
                    <button 
                      onClick={addCustomMaterial}
                      disabled={!customMatName || !customMatUnit}
                      className="bg-slate-800 text-white px-3 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-700 transition-colors flex items-center justify-center min-w-[40px]"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* List of active materials */}
                <div className="space-y-4">
                  {materials.map(mat => (
                    <motion.div 
                      key={mat.name}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm group"
                    >
                      <span className="font-medium text-slate-700">{mat.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border-b border-slate-200 focus-within:border-aaraa-blue">
                          <input
                            type="number"
                            placeholder="0"
                            value={mat.quantity || ''}
                            onChange={(e) => updateMaterialQty(mat.name, parseFloat(e.target.value))}
                            className="w-20 text-right outline-none py-1 bg-transparent"
                          />
                          <span className="text-sm text-slate-400 w-10 text-right">{mat.unit}</span>
                        </div>
                        <button 
                          onClick={() => removeMaterial(mat.name)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <X size={18} />
                        </button>
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
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Camera className="mr-2 text-aaraa-blue" />
                  Site Photos
                </h3>
                
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 transition-colors hover:bg-slate-100 hover:border-aaraa-blue/50 group">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                     <ImageIcon size={32} className="text-slate-400 group-hover:text-aaraa-blue" />
                   </div>
                   <h4 className="font-bold text-slate-700">Upload Site Photos</h4>
                   <p className="text-sm text-slate-500 mb-6">Select up to 5 photos of progress, issues, or completion.</p>
                   
                   <input 
                    type="file" 
                    id="photo-upload" 
                    multiple 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                   />
                   <label 
                     htmlFor="photo-upload"
                     className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold cursor-pointer hover:bg-slate-800 transition-colors"
                   >
                     Select Files
                   </label>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img 
                          src={photo} 
                          alt={`Site upload ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 mt-6">
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
        {step < 5 && (
          <button 
            onClick={() => setStep(Math.min(5, step + 1))}
            className="px-6 py-2 rounded-full bg-slate-800 text-white shadow-md hover:bg-slate-700 transition-colors"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
};
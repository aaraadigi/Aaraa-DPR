import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckSquare, Clock, ArrowRight, Save, LayoutDashboard, Package, Plus, Truck, CheckCircle2, FileText } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Project, ProjectTask, MaterialRequest, DPRRecord } from '../types';
import { MaterialRequestForm } from './MaterialRequestForm';
import { DPREntryForm } from './DPREntryForm';

interface SEDashboardProps {
  projects: Project[];
  tasks: ProjectTask[];
  requests?: MaterialRequest[]; // Passed from App
  onUpdateTask: (taskId: string, status: ProjectTask['status'], notes?: string) => void;
  onUpdateProjectProgress: (projectId: string, progress: number) => void;
  onSaveMaterialRequest?: (req: MaterialRequest) => void;
  onUpdateIndentStatus?: (id: string, status: string, payload?: any) => void;
  onSaveDPR: (data: DPRRecord) => void;
}

export const SEDashboard: React.FC<SEDashboardProps> = ({ 
  projects, 
  tasks, 
  requests = [], 
  onUpdateTask, 
  onUpdateProjectProgress,
  onSaveMaterialRequest,
  onUpdateIndentStatus,
  onSaveDPR
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'indents' | 'dpr'>('tasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [taskNote, setTaskNote] = useState('');
  const [showIndentForm, setShowIndentForm] = useState(false);
  const [grnNote, setGrnNote] = useState('');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length === 1) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  
  // Filter requests for this specific project
  const projectRequests = requests.filter(r => r.projectName === currentProject?.name);

  const handleTaskUpdate = (taskId: string, newStatus: ProjectTask['status']) => {
    onUpdateTask(taskId, newStatus, taskNote);
    setEditingTask(null);
    setTaskNote('');
  };

  const handleReceiveGoods = (reqId: string) => {
    if (!grnNote) return alert("Please enter GRN details/invoice number.");
    if (onUpdateIndentStatus) {
      onUpdateIndentStatus(reqId, 'Goods_Received', { grnDetails: grnNote });
      setGrnNote('');
      setSelectedReqId(null);
    }
  };

  const handleDPRSubmit = (data: DPRRecord) => {
    // Explicitly set the Site Engineer's name so PM/Admin sees "Sakthi Vignesh" instead of generic ID
    const enrichedData = {
      ...data,
      submittedBy: currentProject?.siteEngineer || 'Site Engineer',
    };
    onSaveDPR(enrichedData);
    setActiveTab('tasks');
    alert("Daily Report Submitted Successfully!");
  };

  const handleMaterialRequestSubmit = (data: MaterialRequest) => {
    const enrichedRequest = {
      ...data,
      requestedBy: currentProject?.siteEngineer || 'Site Engineer',
    };
    if (onSaveMaterialRequest) onSaveMaterialRequest(enrichedRequest);
    setShowIndentForm(false);
  };

  if (!selectedProjectId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800">Select Your Site</h2>
          <p className="text-slate-500">Please choose the project you are reporting for today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => (
            <GlassCard 
              key={project.id} 
              className="cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between group"
              onClick={() => setSelectedProjectId(project.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-100 rounded-full text-slate-600 group-hover:bg-aaraa-blue group-hover:text-white transition-colors">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{project.name}</h3>
                  <p className="text-xs text-slate-500">{project.location}</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-300 group-hover:text-aaraa-blue" />
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  if (showIndentForm) {
    return (
      <div className="pt-4 px-4">
        <button 
          onClick={() => setShowIndentForm(false)}
          className="mb-4 text-sm text-slate-500 hover:text-aaraa-blue flex items-center"
        >
          <ArrowRight size={16} className="rotate-180 mr-1"/> Back to Dashboard
        </button>
        <MaterialRequestForm 
          projectName={currentProject?.name}
          onSave={handleMaterialRequestSubmit}
          onCancel={() => setShowIndentForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{currentProject?.name}</h2>
          <p className="text-slate-500 text-sm">Site Engineer Portal</p>
        </div>
        <div className="flex space-x-4">
           {projects.length > 1 && (
             <button 
              onClick={() => setSelectedProjectId('')}
              className="text-sm text-slate-500 font-medium hover:text-aaraa-blue"
            >
              Switch Site
            </button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white/50 p-1 rounded-xl w-fit mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'tasks' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          My Tasks
        </button>
        <button
          onClick={() => setActiveTab('indents')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'indents' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          Material Indents
        </button>
        <button
          onClick={() => setActiveTab('dpr')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'dpr' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          Daily Report
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tasks' && (
          <motion.div
             key="tasks"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Project Status Card */}
            <div className="lg:col-span-1">
              <GlassCard className="sticky top-24">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <LayoutDashboard size={20} className="mr-2 text-aaraa-blue" />
                  Site Status
                </h3>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2 font-medium text-slate-600">
                    <span>Overall Completion</span>
                    <span>{currentProject?.progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentProject?.progress}
                    onChange={(e) => onUpdateProjectProgress(selectedProjectId, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-aaraa-blue"
                  />
                </div>
              </GlassCard>
            </div>

            {/* Tasks List */}
            <div className="lg:col-span-2 space-y-4">
               {projectTasks.length === 0 ? (
                 <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-slate-200">
                   <p className="text-slate-400">No tasks assigned yet.</p>
                 </div>
               ) : (
                 projectTasks.map(task => (
                    <GlassCard key={task.id} className="relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className={`font-bold text-lg ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {task.description}
                        </h4>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mb-4 flex items-center">
                        <Clock size={12} className="mr-1" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>

                      {editingTask === task.id ? (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <input 
                            type="text" 
                            value={taskNote}
                            onChange={(e) => setTaskNote(e.target.value)}
                            placeholder="Update notes..."
                            className="w-full p-2 text-sm border border-slate-300 rounded mb-3 focus:outline-none focus:border-aaraa-blue"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleTaskUpdate(task.id, 'In Progress')} className="flex-1 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">In Progress</button>
                            <button onClick={() => handleTaskUpdate(task.id, 'Completed')} className="flex-1 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded">Completed</button>
                          </div>
                        </div>
                      ) : (
                         task.status !== 'Completed' && (
                           <button onClick={() => setEditingTask(task.id)} className="w-full py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">Update Status</button>
                         )
                      )}
                    </GlassCard>
                 ))
               )}
            </div>
          </motion.div>
        )}

        {activeTab === 'indents' && (
          <motion.div
            key="indents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setShowIndentForm(true)}
                className="flex items-center space-x-2 bg-aaraa-blue text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors"
              >
                <Plus size={18} />
                <span>Raise Material Indent</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {projectRequests.length === 0 ? (
                 <div className="text-center py-10 text-slate-400">No active material requests for this site.</div>
              ) : (
                projectRequests.map(req => (
                  <GlassCard key={req.id} className="relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                         <div className="p-2 bg-slate-100 rounded-lg"><Package size={20} className="text-slate-600"/></div>
                         <div>
                           <h4 className="font-bold text-slate-800">Indent #{req.id.slice(-4)}</h4>
                           <p className="text-xs text-slate-500">{new Date(req.date).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'Closed' ? 'bg-green-100 text-green-700' :
                        req.status === 'Rejected_By_PM' || req.status === 'Returned_To_SE' ? 'bg-red-100 text-red-700' :
                        req.status === 'PO_Raised' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {req.status.replace(/_/g, ' ')}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm text-slate-600">
                      {req.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                          <span>{item.material}</span>
                          <span className="font-medium">{item.quantity} {item.unit}</span>
                        </div>
                      ))}
                    </div>

                    {req.status === 'Returned_To_SE' && (
                       <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                         <p className="text-xs text-red-600 font-bold mb-1">Procurement Comment:</p>
                         <p className="text-sm text-red-700">{req.procurementComments}</p>
                         <button className="mt-2 text-xs font-bold text-red-600 underline">Edit & Resubmit</button>
                       </div>
                    )}

                    {req.status === 'PO_Raised' && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                         <div className="flex items-center text-purple-600 text-xs font-bold mb-2">
                           <Truck size={14} className="mr-1" /> Order Placed (PO: {req.poNumber})
                         </div>
                         {selectedReqId === req.id ? (
                           <div className="bg-slate-50 p-3 rounded-lg">
                             <input 
                               type="text" 
                               placeholder="Enter GRN / Invoice No."
                               value={grnNote}
                               onChange={(e) => setGrnNote(e.target.value)}
                               className="w-full text-sm p-2 border border-slate-300 rounded mb-2 focus:outline-none focus:border-aaraa-blue"
                             />
                             <div className="flex gap-2">
                               <button onClick={() => handleReceiveGoods(req.id)} className="flex-1 bg-green-600 text-white py-2 rounded text-xs font-bold">Confirm Receipt</button>
                               <button onClick={() => setSelectedReqId(null)} className="flex-1 bg-slate-200 text-slate-600 py-2 rounded text-xs font-bold">Cancel</button>
                             </div>
                           </div>
                         ) : (
                           <button 
                             onClick={() => setSelectedReqId(req.id)}
                             className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-500/20"
                           >
                             Receive Goods (GRN)
                           </button>
                         )}
                      </div>
                    )}
                    
                    {req.status === 'Goods_Received' && (
                       <div className="mt-2 text-xs text-green-600 flex items-center font-medium bg-green-50 p-2 rounded">
                         <CheckCircle2 size={14} className="mr-2" /> GRN Submitted: {req.grnDetails}
                       </div>
                    )}
                  </GlassCard>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'dpr' && (
          <motion.div
            key="dpr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DPREntryForm 
              defaultProjectName={currentProject?.name}
              onSave={handleDPRSubmit} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
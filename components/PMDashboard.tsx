import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, User, ArrowRight, Plus, Calendar, CheckCircle2, Circle, AlertCircle, ChevronLeft, Bell, X, PackageCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Project, ProjectTask, Notification, MaterialRequest } from '../types';

interface PMDashboardProps {
  projects: Project[];
  tasks: ProjectTask[];
  notifications: Notification[];
  requests?: MaterialRequest[];
  onAssignTask: (task: ProjectTask) => void;
  onClearNotification: (id: string) => void;
  onUpdateIndentStatus?: (id: string, status: string, payload?: any) => void;
}

export const PMDashboard: React.FC<PMDashboardProps> = ({ 
  projects, 
  tasks, 
  notifications,
  requests = [],
  onAssignTask,
  onClearNotification,
  onUpdateIndentStatus
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'approvals'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  
  // Approvals State
  const [approvalNote, setApprovalNote] = useState('');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const pendingApprovals = requests.filter(req => req.status === 'Pending_PM');

  const handleCreateTask = () => {
    if (!selectedProject || !newTaskDesc || !newTaskDue) return;
    
    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      projectId: selectedProject.id,
      description: newTaskDesc,
      assignedDate: new Date().toISOString(),
      dueDate: newTaskDue,
      status: 'Pending'
    };
    
    onAssignTask(newTask);
    setIsAssigning(false);
    setNewTaskDesc('');
    setNewTaskDue('');
  };

  const handleApproval = (id: string, approved: boolean) => {
    if (!onUpdateIndentStatus) return;
    const status = approved ? 'Approved_By_PM' : 'Rejected_By_PM';
    onUpdateIndentStatus(id, status, { pmComments: approvalNote || (approved ? 'Approved' : 'Rejected') });
    setApprovalNote('');
    setSelectedReqId(null);
  };

  // Simple Donut Chart Component
  const CircularProgress = ({ value, size = 120, strokeWidth = 10, color = "#007AFF" }: { value: number, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-slate-800">{value}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 relative">
      
      {/* Notifications */}
      <div className="fixed top-24 right-4 z-50 w-full max-w-sm space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-slate-100 overflow-hidden flex shadow-blue-900/10">
                <div className="w-1.5 bg-aaraa-blue"></div>
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2 text-aaraa-blue font-bold text-sm mb-1">
                      <Bell size={14} className="fill-current" />
                      <span>{note.projectName || 'System Update'}</span>
                    </div>
                    <button onClick={() => onClearNotification(note.id)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{note.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(note.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Site Overview
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Indent Approvals {pendingApprovals.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingApprovals.length}</span>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'approvals' ? (
          <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Step 3: Validate Indents</h2>
            {pendingApprovals.length === 0 ? (
               <div className="text-center py-20 text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                 <PackageCheck size={32} className="mx-auto mb-3 opacity-20" />
                 <p>No indents pending approval.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map(req => (
                  <GlassCard key={req.id} className="border-l-4 border-amber-500">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="font-bold text-slate-800 text-lg">Indent #{req.id.slice(-4)}</h3>
                         <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${req.urgency === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{req.urgency} Urgency</span>
                            {req.projectName && (
                               <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                 <Building2 size={12} className="mr-1"/> {req.projectName}
                               </span>
                            )}
                         </div>
                         <p className="text-xs text-slate-400 mt-1">Requested by {req.requestedBy}</p>
                       </div>
                       <div className="text-right">
                         <div className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">Pending Step 3</div>
                       </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl mb-4">
                       <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Items</h4>
                       {req.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between border-b border-slate-200 last:border-0 py-1 text-sm text-slate-700">
                           <span>{item.material}</span>
                           <span className="font-bold">{item.quantity} {item.unit}</span>
                         </div>
                       ))}
                       {req.procurementComments && (
                         <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                           <span className="font-bold">Procurement Note:</span> {req.procurementComments}
                         </div>
                       )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="Add approval/rejection note..." 
                        value={selectedReqId === req.id ? approvalNote : ''}
                        onChange={(e) => {
                          setSelectedReqId(req.id);
                          setApprovalNote(e.target.value);
                        }}
                        className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-aaraa-blue"
                      />
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleApproval(req.id, true)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <ThumbsUp size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => handleApproval(req.id, false)}
                          className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-2"
                        >
                          <ThumbsDown size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Existing Project View Logic */
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* ... Previous PM Dashboard content for Projects ... */}
              {!selectedProject ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Project Overview</h2>
              <p className="text-slate-500 mt-2">Monitor progress across all 5 ongoing sites.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <GlassCard 
                  key={project.id} 
                  delay={idx * 0.1} 
                  className="group cursor-pointer hover:border-aaraa-blue/50"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-blue-50 group-hover:text-aaraa-blue transition-colors">
                      <Building2 size={24} />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      project.status === 'Delayed' ? 'bg-red-100 text-red-600' : 
                      project.status === 'Completed' ? 'bg-green-100 text-green-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{project.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 mb-4">
                    <MapPin size={14} className="mr-1" />
                    {project.location}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center text-xs font-medium text-slate-600">
                      <User size={14} className="mr-1" />
                      {project.siteEngineer}
                    </div>
                    <div className="flex items-center text-aaraa-blue font-semibold text-sm">
                      View Details <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 h-1 bg-aaraa-blue transition-all duration-300 w-0 group-hover:w-full" />
                </GlassCard>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <button 
              onClick={() => setSelectedProject(null)}
              className="flex items-center text-slate-500 hover:text-aaraa-blue mb-6 transition-colors font-medium"
            >
              <ChevronLeft size={20} className="mr-1" /> Back to All Projects
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Project Info & Stats */}
              <div className="lg:col-span-1 space-y-6">
                <GlassCard className="text-center py-8">
                  <div className="mb-6 flex justify-center">
                    <CircularProgress value={selectedProject.progress} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedProject.name}</h2>
                  <p className="text-slate-500 text-sm flex items-center justify-center mt-2">
                    <MapPin size={14} className="mr-1" /> {selectedProject.location}
                  </p>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 uppercase font-bold">Site Engineer</p>
                      <p className="text-sm font-semibold text-slate-700 mt-1">{selectedProject.siteEngineer}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-400 uppercase font-bold">Status</p>
                      <p className={`text-sm font-semibold mt-1 ${
                         selectedProject.status === 'Delayed' ? 'text-red-600' : 'text-green-600'
                      }`}>{selectedProject.status}</p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Right Column: Task Management */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Assigned Tasks</h3>
                  <button 
                    onClick={() => setIsAssigning(!isAssigning)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={16} className="mr-2" /> Assign New Task
                  </button>
                </div>

                <AnimatePresence>
                  {isAssigning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <GlassCard className="border-l-4 border-l-aaraa-blue mb-6">
                        <h4 className="font-bold text-slate-700 mb-4">New Task Assignment</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Task Description</label>
                            <input 
                              type="text" 
                              value={newTaskDesc}
                              onChange={(e) => setNewTaskDesc(e.target.value)}
                              placeholder="e.g. Complete 2nd Floor Wiring"
                              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-aaraa-blue"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Due Date</label>
                            <input 
                              type="date" 
                              value={newTaskDue}
                              onChange={(e) => setNewTaskDue(e.target.value)}
                              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-aaraa-blue"
                            />
                          </div>
                          <div className="flex justify-end space-x-3 pt-2">
                            <button 
                              onClick={() => setIsAssigning(false)}
                              className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleCreateTask}
                              disabled={!newTaskDesc || !newTaskDue}
                              className="px-6 py-2 bg-aaraa-blue text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                              Assign Task
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {tasks.filter(t => t.projectId === selectedProject.id).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                      <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                      <p>No active tasks assigned.</p>
                    </div>
                  ) : (
                    tasks.filter(t => t.projectId === selectedProject.id).map(task => (
                      <GlassCard key={task.id} className="!p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 ${
                            task.status === 'Completed' ? 'text-green-500' : 
                            task.status === 'In Progress' ? 'text-blue-500' : 'text-slate-300'
                          }`}>
                            {task.status === 'Completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                          </div>
                          <div>
                            <h4 className={`font-semibold text-slate-800 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                              {task.description}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                              <span className="flex items-center">
                                <Calendar size={12} className="mr-1" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-bold ${
                                task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        {task.updates && (
                          <div className="mt-3 md:mt-0 md:ml-6 bg-slate-50 p-2 rounded-lg text-xs text-slate-600 max-w-xs italic border border-slate-100">
                            " {task.updates} "
                          </div>
                        )}
                      </GlassCard>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
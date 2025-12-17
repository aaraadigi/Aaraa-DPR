import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Login } from './components/Login';
import { DashboardHeader } from './components/DashboardHeader';
import { MahaDashboard } from './components/MahaDashboard';
import { DPRViewer } from './components/DPRViewer';
import { FinanceDashboard } from './components/FinanceDashboard';
import { ProcurementDashboard } from './components/ProcurementDashboard';
import { PMDashboard } from './components/PMDashboard';
import { SEDashboard } from './components/SEDashboard';
import { Footer } from './components/Footer';
import { AuthState, DPRRecord, MaterialRequest, UserRole, Project, ProjectTask, Notification } from './types';
import { PROJECTS_DATA, INITIAL_TASKS } from './constants';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null
  });

  const [dprRecords, setDprRecords] = useState<DPRRecord[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  
  // Project Management State (Local for Demo session)
  const [projects, setProjects] = useState<Project[]>(PROJECTS_DATA);
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_TASKS);
  
  // Centralized Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Fetch Data from Supabase
  useEffect(() => {
    const fetchDPRs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('dpr_records')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching DPRs:', error.message || error);
      } else if (data) {
        const formattedData: DPRRecord[] = data.map((item: any) => ({
          id: item.id,
          date: item.date,
          timestamp: item.timestamp,
          submittedBy: item.submitted_by,
          projectName: item.project_name || '',
          labour: item.labour || [],
          materials: item.materials || [],
          activities: item.activities || [],
          machinery: item.machinery || '',
          safetyObservations: item.safety_observations || '',
          risksAndDelays: item.risks_and_delays || '',
          photos: item.photos || [] // Map the photos array
        }));
        setDprRecords(formattedData);
      }
      setLoading(false);
    };

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('material_requests')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error.message || error);
      } else if (data) {
         const formattedRequests: MaterialRequest[] = data.map((item: any) => {
           return {
             id: item.id,
             date: item.date,
             timestamp: item.timestamp,
             requestedBy: item.requested_by,
             projectName: item.project_name || 'Unknown Project',
             items: item.items || [],
             urgency: item.urgency,
             status: item.status,
             notes: item.notes,
             procurementComments: item.procurement_comments || '',
             pmComments: item.pm_comments || '',
             poNumber: item.po_number || '',
             grnDetails: item.grn_details || ''
           };
         });
         setMaterialRequests(formattedRequests);
      }
    };

    if (auth.isAuthenticated) {
      fetchDPRs();
      fetchRequests();
    }
  }, [auth.isAuthenticated]);

  const handleLogin = (role: UserRole, username: string) => {
    setAuth({
      isAuthenticated: true,
      role,
      user: username
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      role: null,
      user: null
    });
    setDprRecords([]);
    setMaterialRequests([]);
    setNotifications([]);
  };

  const createNotification = (targetRole: UserRole | 'all', message: string, type: 'info' | 'success' | 'warning', projectName?: string) => {
    const newNote: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      message,
      type,
      targetRole,
      projectName,
      read: false
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const handleSaveDPR = async (newRecord: DPRRecord) => {
    setDprRecords(prev => [newRecord, ...prev]);

    const dbPayload = {
      id: newRecord.id,
      date: newRecord.date,
      timestamp: newRecord.timestamp,
      submitted_by: newRecord.submittedBy,
      project_name: newRecord.projectName,
      labour: newRecord.labour,
      materials: newRecord.materials,
      activities: newRecord.activities,
      machinery: newRecord.machinery,
      safety_observations: newRecord.safetyObservations,
      risks_and_delays: newRecord.risksAndDelays,
      photos: newRecord.photos // Save photos array
    };

    const { error } = await supabase.from('dpr_records').insert([dbPayload]);

    if (error) {
      console.error('Error saving DPR:', error.message || error);
      // Even if server save fails (e.g. column missing), UI state is updated.
      // alert('Failed to save to database: ' + (error.message || 'Unknown error'));
    } else {
      // alert('DPR Submitted Successfully!');
      createNotification('pm', `New DPR submitted for ${newRecord.projectName}`, 'info', newRecord.projectName);
    }
  };

  const handleSaveMaterialRequest = async (newRequest: MaterialRequest) => {
    setMaterialRequests(prev => [newRequest, ...prev]);

    const dbPayload = {
      id: newRequest.id,
      date: newRequest.date,
      timestamp: newRequest.timestamp,
      requested_by: newRequest.requestedBy,
      project_name: newRequest.projectName,
      items: newRequest.items,
      urgency: newRequest.urgency,
      status: newRequest.status,
      notes: newRequest.notes
    };

    const { error } = await supabase.from('material_requests').insert([dbPayload]);
      
    if (error) {
      console.error('Error saving Request:', error.message || error);
      alert('Failed to save request to server: ' + (error.message || 'Unknown error'));
    } else {
      alert('Material Request Sent to Procurement!');
      // Notify Procurement
      createNotification('procurement', `New Indent: ${newRequest.items[0].material} + ${newRequest.items.length - 1} more`, 'warning', newRequest.projectName);
    }
  };

  // Central Logic for Status Transitions and Cross-Department Notifications
  const handleUpdateIndentStatus = async (id: string, newStatus: string, payload: any = {}) => {
    // 1. Find the request to get project details for notification
    const request = materialRequests.find(r => r.id === id);
    const projectName = request?.projectName;

    // 2. Optimistic Update
    setMaterialRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus as any, ...payload };
      }
      return req;
    }));

    // 3. Trigger Notifications based on workflow
    switch (newStatus) {
      case 'Pending_PM':
        createNotification('pm', `Indent waiting approval (Checked by Procurement)`, 'info', projectName);
        break;
      case 'Returned_To_SE':
        createNotification('se', `Indent returned by Procurement`, 'warning', projectName);
        break;
      case 'Approved_By_PM':
        createNotification('procurement', `PM Approved Indent for ${projectName}`, 'success', projectName);
        break;
      case 'Rejected_By_PM':
        createNotification('se', `Indent Rejected by PM`, 'warning', projectName);
        createNotification('procurement', `Indent Rejected by PM`, 'info', projectName);
        break;
      case 'PO_Raised':
        createNotification('se', `PO Raised! Materials arriving soon.`, 'success', projectName);
        createNotification('finance', `PO Raised for ${projectName}`, 'info', projectName);
        break;
      case 'Goods_Received':
        createNotification('finance', `GRN Verified. Pending Payment.`, 'warning', projectName);
        createNotification('procurement', `Goods Received at Site`, 'success', projectName);
        break;
      case 'Closed':
        createNotification('se', `Indent Closed & Paid`, 'success', projectName);
        break;
    }

    // 4. DB Update
    const snakePayload: any = { status: newStatus };
    if (payload.procurementComments) snakePayload.procurement_comments = payload.procurementComments;
    if (payload.pmComments) snakePayload.pm_comments = payload.pmComments;
    if (payload.poNumber) snakePayload.po_number = payload.poNumber;
    if (payload.grnDetails) snakePayload.grn_details = payload.grnDetails;

    const { error } = await supabase.from('material_requests').update(snakePayload).eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status in database.');
    }
  };

  const handleAssignTask = (newTask: ProjectTask) => {
    setTasks(prev => [...prev, newTask]);
    const project = projects.find(p => p.id === newTask.projectId);
    createNotification('se', `New Task Assigned: ${newTask.description}`, 'info', project?.name);
    alert('Task Assigned to Site Engineer');
  };

  const handleUpdateTask = (taskId: string, status: ProjectTask['status'], updates?: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, updates: updates || t.updates } : t));
    
    const task = tasks.find(t => t.id === taskId);
    const project = projects.find(p => p.id === task?.projectId);
    
    if (task && project) {
      createNotification('pm', `Task "${task.description}" marked as ${status}`, 'info', project.name);
    }
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleUpdateProjectProgress = (projectId: string, progress: number) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, progress } : p));
  };

  const getHeaderTitle = () => {
    switch (auth.role) {
      case 'maha': return 'Data Entry Portal';
      case 'waaree': return 'Waaree Site Dashboard';
      case 'finance': return 'Accounts & Finance';
      case 'procurement': return 'Procurement Team';
      case 'pm': return 'Project Manager Dashboard';
      case 'se': return 'Site Engineer Portal';
      default: return 'Executive Dashboard';
    }
  };

  // Helper to filter projects for SE
  const getSEProjects = () => {
    if (auth.user === 'Vivek') {
      return projects.filter(p => p.id === 'p6').map(p => ({
        ...p,
        siteEngineer: auth.user || p.siteEngineer
      }));
    }
    return projects;
  };

  // Helper to filter projects for PM
  const getPMProjects = () => {
    if (auth.user === 'Muthu') {
      return projects.filter(p => p.id === 'p6');
    }
    return projects;
  };

  // Filter notifications for the current user
  const getUserNotifications = () => {
    return notifications.filter(n => {
      // 1. Role match
      if (n.targetRole !== 'all' && n.targetRole !== auth.role) return false;
      
      // 2. Project match for specialized users (Muthu/Vivek)
      if (auth.user === 'Muthu' || auth.user === 'Vivek') {
         // Only show system notes or notes for Waaree
         return !n.projectName || n.projectName === 'Waaree Road Project';
      }
      return true;
    }).filter(n => !n.read);
  };

  return (
    <div className="min-h-screen flex flex-col font-inter text-slate-800">
      <AnimatePresence mode="wait">
        {!auth.isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow"
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col"
          >
            <DashboardHeader 
              userRole={auth.role || ''} 
              onLogout={handleLogout}
              title={getHeaderTitle()}
              notifications={getUserNotifications()}
              onClearNotification={handleClearNotification}
            />
            
            <main className="flex-grow">
              {loading && dprRecords.length === 0 && materialRequests.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aaraa-blue"></div>
                </div>
              ) : (
                <>
                  {(auth.role === 'maha' || auth.role === 'waaree') && (
                    <MahaDashboard 
                      onSaveDPR={handleSaveDPR} 
                      onSaveMaterialRequest={handleSaveMaterialRequest}
                      recentDPRs={dprRecords}
                      recentRequests={materialRequests}
                      defaultProjectName={auth.role === 'waaree' ? 'Waaree Road Project' : undefined}
                    />
                  )}
                  {auth.role === 'dpr' && (
                    <DPRViewer 
                      records={dprRecords} 
                      materialRequests={materialRequests}
                    />
                  )}
                  {auth.role === 'finance' && (
                    <FinanceDashboard 
                      dprRecords={dprRecords}
                      materialRequests={materialRequests}
                      onUpdateStatus={(id, status) => handleUpdateIndentStatus(id, status)}
                    />
                  )}
                  {auth.role === 'procurement' && (
                    <ProcurementDashboard 
                      materialRequests={materialRequests}
                      onUpdateIndentStatus={handleUpdateIndentStatus}
                    />
                  )}
                  {auth.role === 'pm' && (
                    <PMDashboard 
                      projects={getPMProjects()}
                      tasks={tasks}
                      notifications={getUserNotifications()} // Pass filtered list
                      requests={materialRequests}
                      onAssignTask={handleAssignTask}
                      onClearNotification={handleClearNotification}
                      onUpdateIndentStatus={handleUpdateIndentStatus}
                    />
                  )}
                  {auth.role === 'se' && (
                    <SEDashboard 
                      projects={getSEProjects()}
                      tasks={tasks}
                      requests={materialRequests}
                      onUpdateTask={handleUpdateTask}
                      onUpdateProjectProgress={handleUpdateProjectProgress}
                      onSaveMaterialRequest={handleSaveMaterialRequest}
                      onUpdateIndentStatus={handleUpdateIndentStatus}
                      onSaveDPR={handleSaveDPR}
                    />
                  )}
                </>
              )}
            </main>
            
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
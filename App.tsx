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
  
  // Notifications for PM
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
          projectName: item.project_name || '', // Fetch project name
          labour: item.labour || [],
          materials: item.materials || [],
          activities: item.activities || [],
          machinery: item.machinery || '',
          safetyObservations: item.safety_observations || '',
          risksAndDelays: item.risks_and_delays || ''
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
             // Direct mapping from DB column now that SQL is applied
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
  };

  const handleSaveDPR = async (newRecord: DPRRecord) => {
    setDprRecords(prev => [newRecord, ...prev]);

    const dbPayload = {
      id: newRecord.id,
      date: newRecord.date,
      timestamp: newRecord.timestamp,
      submitted_by: newRecord.submittedBy,
      project_name: newRecord.projectName, // Save project name
      labour: newRecord.labour,
      materials: newRecord.materials,
      activities: newRecord.activities,
      machinery: newRecord.machinery,
      safety_observations: newRecord.safetyObservations,
      risks_and_delays: newRecord.risksAndDelays
    };

    const { error } = await supabase
      .from('dpr_records')
      .insert([dbPayload]);

    if (error) {
      console.error('Error saving DPR:', error.message || error);
      alert('Failed to save to database: ' + (error.message || 'Unknown error'));
    } else {
      alert('DPR Submitted Successfully!');
    }
  };

  // Step 1: SE Raises Indent
  const handleSaveMaterialRequest = async (newRequest: MaterialRequest) => {
    setMaterialRequests(prev => [newRequest, ...prev]);

    const dbPayload = {
      id: newRequest.id,
      date: newRequest.date,
      timestamp: newRequest.timestamp,
      requested_by: newRequest.requestedBy,
      project_name: newRequest.projectName, // Direct save to column
      items: newRequest.items,
      urgency: newRequest.urgency,
      status: newRequest.status,
      notes: newRequest.notes
    };

    const { error } = await supabase
      .from('material_requests')
      .insert([dbPayload]);
      
    if (error) {
      console.error('Error saving Request:', error.message || error);
      alert('Failed to save request to server: ' + (error.message || 'Unknown error'));
    } else {
      alert('Material Request Sent to Procurement!');
    }
  };

  // Central Logic for Status Transitions
  const handleUpdateIndentStatus = async (id: string, newStatus: string, payload: any = {}) => {
    // Optimistic Update
    setMaterialRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus as any, ...payload };
      }
      return req;
    }));

    // DB Update
    const snakePayload: any = { status: newStatus };
    if (payload.procurementComments) snakePayload.procurement_comments = payload.procurementComments;
    if (payload.pmComments) snakePayload.pm_comments = payload.pmComments;
    if (payload.poNumber) snakePayload.po_number = payload.poNumber;
    if (payload.grnDetails) snakePayload.grn_details = payload.grnDetails;

    const { error } = await supabase
      .from('material_requests')
      .update(snakePayload)
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status in database.');
    } else {
        // Optional: Trigger Notification based on status change
        if (newStatus === 'Pending_PM') {
             setNotifications(prev => [{ id: `n-${Date.now()}`, message: 'New Indent waiting for approval', timestamp: Date.now(), type: 'info', projectName: 'Procurement' }, ...prev]);
        }
    }
  };

  // PM Assigns Task
  const handleAssignTask = (newTask: ProjectTask) => {
    setTasks(prev => [...prev, newTask]);
    alert('Task Assigned to Site Engineer');
  };

  // SE Updates Task -> Triggers Notification for PM
  const handleUpdateTask = (taskId: string, status: ProjectTask['status'], updates?: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, updates: updates || t.updates } : t));
    
    // Create Notification
    const task = tasks.find(t => t.id === taskId);
    const project = projects.find(p => p.id === task?.projectId);
    
    if (task && project) {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        type: 'info',
        projectName: project.name,
        message: `Task updated: "${task.description}" marked as ${status}. ${updates ? `Note: ${updates}` : ''}`
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // SE Updates Project Progress
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

  // Helper to filter and personalize projects for SE
  const getSEProjects = () => {
    // If it's Sakthi or Vivek, show only Project 6 (Waaree)
    if (auth.user === 'Sakthi Vignesh' || auth.user === 'Vivek') {
      return projects.filter(p => p.id === 'p6').map(p => ({
        ...p,
        // Dynamically override the site engineer name to match the current user
        // This ensures the reports are tagged correctly in SEDashboard
        siteEngineer: auth.user || p.siteEngineer
      }));
    }
    return projects;
  };

  // Helper to filter projects for PM
  const getPMProjects = () => {
    // If it's Muthu, show only Project 6 (Waaree)
    if (auth.user === 'Muthu') {
      return projects.filter(p => p.id === 'p6');
    }
    return projects;
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
                      notifications={notifications}
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
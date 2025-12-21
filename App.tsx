
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Login } from './components/Login';
import { DashboardHeader } from './components/DashboardHeader';
import { SideMenu } from './components/SideMenu';
import { MahaDashboard } from './components/MahaDashboard';
import { DPRViewer } from './components/DPRViewer';
import { FinanceDashboard } from './components/FinanceDashboard';
import { ProcurementDashboard } from './components/ProcurementDashboard';
import { CostingDashboard } from './components/CostingDashboard';
import { PMDashboard } from './components/PMDashboard';
import { SEDashboard } from './components/SEDashboard';
import { OpsDashboard } from './components/OpsDashboard';
import { MDDashboard } from './components/MDDashboard';
import { PettyCash } from './components/PettyCash';
import { DailyTaskBoard } from './components/DailyTaskBoard';
import { Footer } from './components/Footer';
import { AuthState, DPRRecord, MaterialRequest, UserRole, Project, ProjectTask, Notification, PettyCashEntry } from './types';
import { PROJECTS_DATA, INITIAL_TASKS } from './constants';
import { supabase } from './lib/supabaseClient';
import { Menu, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, role: null, user: null, userId: '' });
  const [activeView, setActiveView] = useState<'dashboard' | 'petty_cash' | 'dpr_viewer' | 'daily_tasks'>('dashboard');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [dprRecords, setDprRecords] = useState<DPRRecord[]>([]);
  const [pettyCashEntries, setPettyCashEntries] = useState<PettyCashEntry[]>([]);
  const [projects] = useState<Project[]>(PROJECTS_DATA);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const mapRequest = useCallback((item: any): MaterialRequest => ({
    id: item.id, 
    date: item.date, 
    timestamp: Number(item.timestamp), 
    requestedBy: item.requested_by,
    projectName: item.project_name, 
    items: item.items || [], 
    urgency: item.urgency,
    status: item.status, 
    notes: item.notes,
    deadline: item.deadline,
    indentSheetPhoto: item.indent_sheet_photo,
    quotes: item.quotes || [], 
    marketAnalysis: item.market_analysis,
    pmComments: item.pm_comments, 
    opsComments: item.ops_comments, 
    mdComments: item.md_comments,
    paymentRef: item.payment_ref, 
    grnDetails: item.grn_details, 
    grnPhotos: item.grn_photos || [],
    vendorBillPhoto: item.vendor_bill_photo,
    costingComments: item.costing_comments
  }), []);

  const mapDPR = useCallback((item: any): DPRRecord => ({
    id: item.id,
    date: item.date,
    timestamp: Number(item.timestamp),
    submittedBy: item.submitted_by,
    projectName: item.project_name,
    labour: item.labour || [],
    materials: item.materials || [],
    activities: item.activities || [],
    machinery: item.machinery,
    safetyObservations: item.safety_observations,
    risks_and_delays: item.risks_and_delays,
    photos: item.photos || []
  }), []);

  const mapTask = useCallback((item: any): ProjectTask => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
    assignedTo: item.assigned_to,
    projectName: item.project_name,
    dueDate: item.due_date,
    priority: item.priority,
    response: item.response,
    respondedAt: item.responded_at,
    assignedBy: item.assigned_by
  }), []);

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const fetchData = async () => {
      try {
        const { data: requests } = await supabase.from('material_requests').select('*').order('timestamp', { ascending: false });
        if (requests) setMaterialRequests(requests.map(mapRequest));

        const { data: dprs } = await supabase.from('dpr_records').select('*').order('timestamp', { ascending: false });
        if (dprs) setDprRecords(dprs.map(mapDPR));

        const { data: projectTasks } = await supabase.from('project_tasks').select('*').order('created_at', { ascending: false });
        if (projectTasks) setTasks(projectTasks.map(mapTask));

        const { data: pettyCash } = await supabase.from('petty_cash').select('*').order('id', { ascending: false });
        if (pettyCash) setPettyCashEntries(pettyCash);
      } catch (err) {
        console.error("Fetch failed (Check if tables exist):", err);
      }
    };
    fetchData();

    // Setup Realtime Channels
    const requestsChannel = supabase.channel('requests-flow')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'material_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newReq = mapRequest(payload.new);
          setMaterialRequests(prev => [newReq, ...prev.filter(r => r.id !== newReq.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedReq = mapRequest(payload.new);
          setMaterialRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
        }
      }).subscribe();

    const dprChannel = supabase.channel('dpr-flow')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dpr_records' }, (payload) => {
        const newDpr = mapDPR(payload.new);
        setDprRecords(prev => [newDpr, ...prev.filter(d => d.id !== newDpr.id)]);
      }).subscribe();

    const taskChannel = supabase.channel('tasks-flow')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [mapTask(payload.new), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = mapTask(payload.new);
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        }
      }).subscribe();

    const pettyCashChannel = supabase.channel('petty-cash-flow')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'petty_cash' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPettyCashEntries(prev => [payload.new as PettyCashEntry, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as PettyCashEntry;
          setPettyCashEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
        } else if (payload.eventType === 'DELETE') {
          setPettyCashEntries(prev => prev.filter(e => e.id !== payload.old.id));
        }
      }).subscribe();

    return () => { 
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(dprChannel);
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(pettyCashChannel);
    };
  }, [auth.isAuthenticated, mapRequest, mapDPR, mapTask]);

  const handleSaveDPR = async (dpr: DPRRecord) => {
    const { error } = await supabase.from('dpr_records').insert({
      id: dpr.id,
      timestamp: dpr.timestamp,
      date: dpr.date,
      submitted_by: dpr.submittedBy,
      project_name: dpr.projectName,
      labour: dpr.labour,
      materials: dpr.materials,
      activities: dpr.activities,
      machinery: dpr.machinery,
      safety_observations: dpr.safetyObservations,
      risks_and_delays: dpr.risksAndDelays,
      photos: dpr.photos
    });
    if (error) throw error;
  };

  const handleSaveMaterialRequest = async (req: MaterialRequest) => {
    const { error } = await supabase.from('material_requests').insert({
      id: req.id,
      timestamp: req.timestamp,
      date: req.date,
      requested_by: req.requestedBy,
      project_name: req.projectName,
      items: req.items,
      urgency: req.urgency,
      status: req.status,
      notes: req.notes,
      deadline: req.deadline,
      // Fix: using indentSheetPhoto instead of indent_sheet_photo to match MaterialRequest interface
      indent_sheet_photo: req.indentSheetPhoto
    });
    if (error) throw error;
  };

  const handleUpdateStatus = async (id: string, newStatus: string, payload: any = {}) => {
    const dbPayload: any = { 
      status: newStatus,
      items: payload.items,
      pm_comments: payload.pmComments,
      market_analysis: payload.marketAnalysis,
      costing_comments: payload.costingComments,
      quotes: payload.quotes,
      ops_comments: payload.opsComments,
      md_comments: payload.mdComments,
      payment_ref: payload.paymentRef,
      grn_details: payload.grnDetails,
      grn_photos: payload.grnPhotos,
      vendor_bill_photo: payload.vendorBillPhoto
    };
    Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);
    await supabase.from('material_requests').update(dbPayload).eq('id', id);
  };

  const handleAssignTask = async (task: ProjectTask) => {
    await supabase.from('project_tasks').insert({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      assigned_to: task.assignedTo,
      assigned_by: auth.user,
      project_name: task.projectName,
      priority: task.priority,
      due_date: task.dueDate
    });
  };

  const handleUpdateTaskResponse = async (taskId: string, response: string) => {
    await supabase.from('project_tasks').update({
      response: response,
      responded_at: new Date().toISOString(),
      status: 'in-progress'
    }).eq('id', taskId);
  };

  const getHeaderTitle = () => {
    if (activeView === 'petty_cash') return 'Petty Cash Ledger';
    if (activeView === 'dpr_viewer') return 'Reports Archive';
    if (activeView === 'daily_tasks') return 'Personal Task Journal';
    switch(auth.role) {
      case 'pm': return 'PM Dashboard';
      case 'ops': return 'Operations Head';
      case 'md': return 'Management Portal';
      case 'costing': return 'QS & Billing';
      case 'finance': return 'Finance Portal';
      case 'se': return 'Site Dashboard';
      case 'maha': return 'Admin Dashboard';
      default: return 'Enterprise Resource Portal';
    }
  };

  const renderActiveView = () => {
    if (activeView === 'petty_cash') {
      return <PettyCash role={auth.role || ''} userId={auth.userId || ''} userName={auth.user || ''} />;
    }
    if (activeView === 'dpr_viewer') {
      return <DPRViewer records={dprRecords} materialRequests={materialRequests} />;
    }
    if (activeView === 'daily_tasks') {
      return <DailyTaskBoard userId={auth.userId} />;
    }

    switch(auth.role) {
      case 'pm': return (
        <PMDashboard 
          projects={projects.filter(p => p.projectManager === auth.user)} 
          tasks={tasks} 
          notifications={[]} 
          requests={materialRequests} 
          pettyCashEntries={pettyCashEntries}
          onAssignTask={handleAssignTask} 
          onClearNotification={() => {}} 
          onUpdateIndentStatus={handleUpdateStatus} 
          onNavigateView={setActiveView}
        />
      );
      case 'costing': return <CostingDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />;
      case 'procurement': return <ProcurementDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />;
      case 'ops': return <OpsDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />;
      case 'md': return (
        <MDDashboard 
          materialRequests={materialRequests} 
          tasks={tasks} 
          projects={projects}
          dprRecords={dprRecords}
          onUpdateIndentStatus={handleUpdateStatus} 
        />
      );
      case 'finance': return <FinanceDashboard materialRequests={materialRequests} onUpdateStatus={handleUpdateStatus} />;
      case 'se': return (
        <SEDashboard 
          userName={auth.user || 'Site Engineer'}
          userId={auth.userId}
          projects={projects.filter(p => p.siteEngineer === auth.user)} 
          tasks={tasks.filter(t => t.assignedTo === auth.user)} 
          requests={materialRequests} 
          dprRecords={dprRecords}
          onUpdateTask={() => {}} 
          onUpdateProjectProgress={() => {}} 
          onSaveDPR={handleSaveDPR} 
          onUpdateIndentStatus={handleUpdateStatus} 
          onSaveMaterialRequest={handleSaveMaterialRequest}
          onRespondToTask={handleUpdateTaskResponse}
        />
      );
      case 'maha': return (
        <MahaDashboard 
          userId={auth.userId}
          username={auth.user || 'Admin'}
          onSaveDPR={handleSaveDPR} 
          onSaveMaterialRequest={handleSaveMaterialRequest} 
          recentDPRs={dprRecords} 
          recentRequests={materialRequests} 
        />
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1c1c1e] transition-colors duration-300">
      <AnimatePresence mode="wait">
        {!auth.isAuthenticated ? (
          <Login onLogin={(role, user, userId) => setAuth({ isAuthenticated: true, role, user, userId })} />
        ) : (
          <div className="flex-grow flex flex-col">
            <SideMenu 
              isOpen={isSideMenuOpen} 
              onClose={() => setIsSideMenuOpen(false)} 
              role={auth.role}
              userName={auth.user || ''}
              userId={auth.userId}
              activeView={activeView}
              onNavigate={setActiveView}
              onLogout={() => setAuth({ isAuthenticated: false, role: null, user: null, userId: '' })}
            />
            
            <header className="sticky top-0 z-50 px-6 py-4 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm flex items-center justify-between no-print transition-colors duration-300">
              <div className="flex items-center space-x-4">
                <button onClick={() => setIsSideMenuOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  <Menu size={24} className="text-slate-900 dark:text-white" />
                </button>
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">AARAA Enterprise</h1>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white hidden lg:block">{getHeaderTitle()}</h2>
              
              <div className="flex items-center space-x-3 md:space-x-5">
                 <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                 >
                   {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
                 </button>

                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{auth.user}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{auth.userId}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-lg">
                    {auth.user?.substring(0, 2).toUpperCase()}
                 </div>
              </div>
            </header>

            <main className="flex-grow pt-8">
              {renderActiveView()}
            </main>
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default App;

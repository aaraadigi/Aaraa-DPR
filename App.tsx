
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Login } from './components/Login';
import { DashboardHeader } from './components/DashboardHeader';
import { MahaDashboard } from './components/MahaDashboard';
import { DPRViewer } from './components/DPRViewer';
import { FinanceDashboard } from './components/FinanceDashboard';
import { ProcurementDashboard } from './components/ProcurementDashboard';
import { CostingDashboard } from './components/CostingDashboard';
import { PMDashboard } from './components/PMDashboard';
import { SEDashboard } from './components/SEDashboard';
import { OpsDashboard } from './components/OpsDashboard';
import { MDDashboard } from './components/MDDashboard';
import { Footer } from './components/Footer';
import { AuthState, DPRRecord, MaterialRequest, UserRole, Project, ProjectTask, Notification } from './types';
import { PROJECTS_DATA, INITIAL_TASKS } from './constants';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, role: null, user: null });
  const [dprRecords, setDprRecords] = useState<DPRRecord[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>(PROJECTS_DATA);
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_TASKS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    const fetchRequests = async () => {
      const { data } = await supabase.from('material_requests').select('*').order('timestamp', { ascending: false });
      if (data) {
        const mapped: MaterialRequest[] = data.map((item: any) => ({
          id: item.id, date: item.date, timestamp: item.timestamp, requestedBy: item.requested_by,
          projectName: item.project_name, items: item.items, urgency: item.urgency,
          status: item.status, notes: item.notes, quotes: item.quotes, marketAnalysis: item.market_analysis,
          pmComments: item.pm_comments, opsComments: item.ops_comments, mdComments: item.md_comments,
          paymentRef: item.payment_ref, grnDetails: item.grn_details, grnPhotos: item.grn_photos,
          vendorBillPhoto: item.vendor_bill_photo
        }));
        setMaterialRequests(mapped);
      }
    };
    fetchRequests();
  }, [auth.isAuthenticated]);

  const handleUpdateStatus = async (id: string, newStatus: string, payload: any = {}) => {
    setMaterialRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any, ...payload } : r));
    const snakePayload: any = { 
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
    await supabase.from('material_requests').update(snakePayload).eq('id', id);
  };

  const getHeaderTitle = () => {
    switch(auth.role) {
      case 'pm': return 'PM Dashboard - Mathiazhagan';
      case 'ops': return 'Operations Head - Shanmugam';
      case 'md': return 'Management Portal - Nandakumar';
      case 'costing': return 'QS & Billing - Babu Sir';
      case 'finance': return 'Finance Portal - Sudha';
      case 'se': return `Site Dashboard - ${auth.user}`;
      default: return 'Enterprise Resource Portal';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter text-slate-800">
      <AnimatePresence mode="wait">
        {!auth.isAuthenticated ? (
          <Login onLogin={(role, user) => setAuth({ isAuthenticated: true, role, user })} />
        ) : (
          <div className="flex-grow flex flex-col">
            <DashboardHeader userRole={auth.role || ''} onLogout={() => setAuth({ isAuthenticated: false, role: null, user: null })} title={getHeaderTitle()} />
            <main className="flex-grow">
              {auth.role === 'pm' && <PMDashboard projects={projects} tasks={tasks} notifications={notifications} requests={materialRequests} onAssignTask={() => {}} onClearNotification={() => {}} onUpdateIndentStatus={handleUpdateStatus} />}
              {auth.role === 'costing' && <CostingDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />}
              {auth.role === 'procurement' && <ProcurementDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />}
              {auth.role === 'ops' && <OpsDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />}
              {auth.role === 'md' && <MDDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />}
              {auth.role === 'finance' && <FinanceDashboard materialRequests={materialRequests} onUpdateStatus={handleUpdateStatus} />}
              {auth.role === 'se' && <SEDashboard projects={projects} tasks={tasks} requests={materialRequests} onUpdateTask={() => {}} onUpdateProjectProgress={() => {}} onSaveDPR={() => {}} onUpdateIndentStatus={handleUpdateStatus} onSaveMaterialRequest={(data) => { setMaterialRequests(p => [data, ...p]); supabase.from('material_requests').insert({ id: data.id, project_name: data.projectName, items: data.items, urgency: data.urgency, status: data.status, requested_by: data.requestedBy }).then(); }} />}
              {auth.role === 'maha' && <MahaDashboard onSaveDPR={() => {}} onSaveMaterialRequest={() => {}} recentDPRs={dprRecords} recentRequests={materialRequests} username={auth.user || 'Admin'} />}
              {auth.role === 'dpr' && <DPRViewer records={dprRecords} materialRequests={materialRequests} />}
            </main>
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default App;

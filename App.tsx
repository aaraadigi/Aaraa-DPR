
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
import { Footer } from './components/Footer';
import { AuthState, DPRRecord, MaterialRequest, UserRole, Project, ProjectTask, Notification } from './types';
import { PROJECTS_DATA, INITIAL_TASKS } from './constants';
import { supabase } from './lib/supabaseClient';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, role: null, user: null, userId: '' });
  const [activeView, setActiveView] = useState<'dashboard' | 'petty_cash' | 'dpr_viewer'>('dashboard');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [dprRecords, setDprRecords] = useState<DPRRecord[]>([]);
  const [projects] = useState<Project[]>(PROJECTS_DATA);
  const [tasks] = useState<ProjectTask[]>(INITIAL_TASKS);

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

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const fetchData = async () => {
      const { data: requests } = await supabase.from('material_requests').select('*').order('timestamp', { ascending: false });
      if (requests) setMaterialRequests(requests.map(mapRequest));
    };
    fetchData();

    const channel = supabase.channel('requests-flow')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'material_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newReq = mapRequest(payload.new);
          setMaterialRequests(prev => [newReq, ...prev.filter(r => r.id !== newReq.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedReq = mapRequest(payload.new);
          setMaterialRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [auth.isAuthenticated, mapRequest]);

  const handleUpdateStatus = async (id: string, newStatus: string, payload: any = {}) => {
    setMaterialRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any, ...payload } : r));
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

  const getHeaderTitle = () => {
    if (activeView === 'petty_cash') return 'Petty Cash Ledger';
    if (activeView === 'dpr_viewer') return 'Reports Archive';
    switch(auth.role) {
      case 'pm': return 'PM Dashboard';
      case 'ops': return 'Operations Head';
      case 'md': return 'Management Portal';
      case 'costing': return 'QS & Billing';
      case 'finance': return 'Finance Portal';
      case 'se': return 'Site Dashboard';
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

    switch(auth.role) {
      case 'pm': return <PMDashboard projects={projects} tasks={tasks} notifications={[]} requests={materialRequests} onAssignTask={() => {}} onClearNotification={() => {}} onUpdateIndentStatus={handleUpdateStatus} />;
      case 'costing': return <CostingDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />;
      case 'procurement': return <ProcurementDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />;
      case 'ops': return <OpsDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />;
      case 'md': return <MDDashboard materialRequests={materialRequests} onUpdateIndentStatus={handleUpdateStatus} />;
      case 'finance': return <FinanceDashboard materialRequests={materialRequests} onUpdateStatus={handleUpdateStatus} />;
      case 'se': return (
        <SEDashboard 
          userName={auth.user || 'Site Engineer'}
          projects={projects.filter(p => p.siteEngineer === auth.user)} 
          tasks={tasks} 
          requests={materialRequests} 
          onUpdateTask={() => {}} 
          onUpdateProjectProgress={() => {}} 
          onSaveDPR={() => {}} 
          onUpdateIndentStatus={handleUpdateStatus} 
          onSaveMaterialRequest={() => {}} 
        />
      );
      case 'maha': return <MahaDashboard onSaveDPR={() => {}} onSaveMaterialRequest={() => {}} recentDPRs={dprRecords} recentRequests={materialRequests} username={auth.user || 'Admin'} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter text-slate-800 bg-slate-50">
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
              activeView={activeView}
              onNavigate={setActiveView}
              onLogout={() => setAuth({ isAuthenticated: false, role: null, user: null, userId: '' })}
            />
            
            <header className="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm flex items-center justify-between no-print">
              <div className="flex items-center space-x-4">
                <button onClick={() => setIsSideMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <Menu size={24} className="text-slate-900" />
                </button>
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold text-slate-800 tracking-tight">AARAA Enterprise</h1>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 hidden lg:block">{getHeaderTitle()}</h2>
              <div className="flex items-center space-x-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900">{auth.user}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{auth.userId}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Login } from './components/Login';
import { DashboardHeader } from './components/DashboardHeader';
import { MahaDashboard } from './components/MahaDashboard';
import { DPRViewer } from './components/DPRViewer';
import { Footer } from './components/Footer';
import { AuthState, DPRRecord, UserRole } from './types';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null
  });

  const [dprRecords, setDprRecords] = useState<DPRRecord[]>([]);
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
        console.error('Error fetching DPRs:', error);
        // Fallback to empty or local cache if needed, for now just empty
      } else if (data) {
        // Map database columns (snake_case) to app types (camelCase)
        const formattedData: DPRRecord[] = data.map((item: any) => ({
          id: item.id,
          date: item.date,
          timestamp: item.timestamp,
          submittedBy: item.submitted_by,
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

    // Trigger fetch when authenticated
    if (auth.isAuthenticated) {
      fetchDPRs();
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
  };

  const handleSaveDPR = async (newRecord: DPRRecord) => {
    // Optimistic UI Update
    setDprRecords(prev => [newRecord, ...prev]);

    // Prepare payload for Supabase (map to snake_case)
    const dbPayload = {
      id: newRecord.id,
      date: newRecord.date,
      timestamp: newRecord.timestamp,
      submitted_by: newRecord.submittedBy,
      labour: newRecord.labour,
      materials: newRecord.materials,
      activities: newRecord.activities,
      machinery: newRecord.machinery,
      safety_observations: newRecord.safetyObservations,
      risks_and_delays: newRecord.risksAndDelays
    };

    // Insert into Supabase
    const { error } = await supabase
      .from('dpr_records')
      .insert([dbPayload]);

    if (error) {
      console.error('Error saving DPR:', error);
      alert('Failed to save to database. Please check connection.');
      // Optionally rollback state here
    } else {
      alert('DPR Submitted Successfully!');
    }
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
              title={auth.role === 'maha' ? 'Data Entry Portal' : 'Executive Dashboard'} 
            />
            
            <main className="flex-grow">
              {/* Show loading state if fetching for the first time */}
              {loading && dprRecords.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aaraa-blue"></div>
                </div>
              ) : (
                <>
                  {auth.role === 'maha' ? (
                    <MahaDashboard onSaveDPR={handleSaveDPR} recentDPRs={dprRecords} />
                  ) : (
                    <DPRViewer records={dprRecords} />
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
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/pages/AuthPage';

// Pages
import Dashboard from '@/pages/Dashboard';
import DSATracker from '@/pages/DSATracker';
import RoadmapPage from '@/pages/RoadmapPage';
import DailyTracker from '@/pages/DailyTracker';
import ConceptTracker from '@/pages/ConceptTracker';
import RevisionPlanner from '@/pages/RevisionPlanner';
import JobApplications from '@/pages/JobApplications';
import SettingsPage from '@/pages/SettingsPage';

import ResumeTracker from '@/pages/ResumeTracker';
import GitHubProjects from '@/pages/GitHubProjects';
import MockInterviews from '@/pages/MockInterviews';

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }
  
  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dsa" element={<DSATracker />} />
        <Route path="/daily" element={<DailyTracker />} />
        <Route path="/concepts" element={<ConceptTracker />} />
        <Route path="/revisions" element={<RevisionPlanner />} />
        <Route path="/jobs" element={<JobApplications />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/roadmap/:name" element={<RoadmapPage />} />
        <Route path="/resumes" element={<ResumeTracker />} />
        <Route path="/github" element={<GitHubProjects />} />
        <Route path="/mock-interviews" element={<MockInterviews />} />
        
        {/* Placeholder routes for others */}
        <Route path="/today" element={<div className="p-8">Today's Planner (Coming Soon)</div>} />
        <Route path="/reports/weekly" element={<div className="p-8">Weekly Reports (Coming Soon)</div>} />
        <Route path="/reports/monthly" element={<div className="p-8">Monthly Reports (Coming Soon)</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" theme="system" richColors />
        <ProtectedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

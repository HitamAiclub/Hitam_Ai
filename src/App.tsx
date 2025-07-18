import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { testFirebaseConnection } from './firebase.js';
import Navbar from './components/Layout/Navbar.jsx';
import AnimatedBackground from './components/Layout/AnimatedBackground.jsx';
import HomePage from './pages/HomePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import UpcomingActivities from './pages/UpcomingActivities.jsx';
import JoinClub from './pages/JoinClub.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import CommitteeMembers from './pages/admin/CommitteeMembers.jsx';
import FormSubmissions from './pages/admin/FormSubmissions.jsx';
import CommunityMembers from './pages/admin/CommunityMembers.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  useEffect(() => {
    // Initialize Firebase connection
    testFirebaseConnection();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
            <AnimatedBackground />
            <Navbar />
            <main className="relative z-20">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/upcoming" element={<UpcomingActivities />} />
                <Route path="/join" element={<JoinClub />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/committee" element={
                  <ProtectedRoute>
                    <CommitteeMembers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/submissions" element={
                  <ProtectedRoute>
                    <FormSubmissions />
                  </ProtectedRoute>
                } />
                <Route path="/admin/community" element={
                  <ProtectedRoute>
                    <CommunityMembers />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
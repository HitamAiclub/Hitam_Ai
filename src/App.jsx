import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import AnimatedBackground from './components/layout/AnimatedBackground';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import EventsPage from './pages/public/EventsPage';
import UpcomingActivitiesPage from './pages/public/UpcomingActivitiesPage';
import JoinClubPage from './pages/public/JoinClubPage';
import LoginPage from './pages/public/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminCommittee from './pages/admin/AdminCommittee';
import AdminClubMembers from './pages/admin/AdminClubMembers';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <AnimatedBackground />
            <Navbar />
            <main className="relative z-10">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/upcoming" element={<UpcomingActivitiesPage />} />
                <Route path="/join" element={<JoinClubPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/home" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events" element={
                  <ProtectedRoute>
                    <AdminEvents />
                  </ProtectedRoute>
                } />
                <Route path="/admin/registrations/:eventId" element={
                  <ProtectedRoute>
                    <AdminRegistrations />
                  </ProtectedRoute>
                } />
                <Route path="/admin/committee" element={
                  <ProtectedRoute>
                    <AdminCommittee />
                  </ProtectedRoute>
                } />
                <Route path="/admin/club-members" element={
                  <ProtectedRoute>
                    <AdminClubMembers />
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
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';

// Import Pages
import PublicHome from './pages/PublicHome';
import PublicEvents from './pages/PublicEvents';
import PublicCollections from './pages/PublicCollections';
import PublicAnnouncements from './pages/PublicAnnouncements';
import PublicGallery from './pages/PublicGallery';
import PublicDocuments from './pages/PublicDocuments';
import PublicVolunteers from './pages/PublicVolunteers';
import Login from './pages/Login';

// Import Committee Pages
import CommitteeDashboard from './pages/CommitteeDashboard';
import ManageCollections from './pages/ManageCollections';
import ManageExpenses from './pages/ManageExpenses';
import ManageEvents from './pages/ManageEvents';
import ManageRegistrations from './pages/ManageRegistrations';
import ManageVolunteers from './pages/ManageVolunteers';
import ManageAnnouncements from './pages/ManageAnnouncements';
import ManageGallery from './pages/ManageGallery';
import ManageDocuments from './pages/ManageDocuments';
import FinancialReports from './pages/FinancialReports';
import ActivityLog from './pages/ActivityLog';
import CommitteeUsers from './pages/CommitteeUsers';
import Settings from './pages/Settings';

// Public Layout Wrap
const PublicLayout = () => {
  return (
    <div>
      <Navbar />
      <main style={{ minHeight: '85vh' }}>
        <Outlet />
      </main>
      <footer style={{ background: 'var(--grad-dark)', color: 'rgba(255,255,255,0.4)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid hsl(30, 10%, 15%)' }}>
        <p style={{ wordBreak: 'break-word', lineHeight: '1.6' }}>
          © 2026 Vinayaka Chavithi Festival Committee.{' '}
          <span style={{ display: 'inline-block' }}>All rights reserved.</span>
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', wordBreak: 'break-word', lineHeight: '1.6' }}>Jai Ganesha. May Lord Ganesha remove all your obstacles and bless you with wisdom.</p>
      </footer>
    </div>
  );
};

// Committee Admin Layout Wrap
const CommitteeLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-overlay open"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Panel */}
      <div className="main-content">
        <header className="committee-header">
          <div className="committee-header-left">
            <button
              className="menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Committee Navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span className="committee-portal-title">
              Vinayaka Festival Portal
            </span>
          </div>

          <div className="committee-user-info">
            <span className="committee-user-name">@{user?.username}</span>
            <span className="badge badge-submitted committee-user-badge">{user?.role}</span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
};

// Toast Notifications Component
const ToastOverlay = () => {
  const { toasts } = useAuth();
  
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {toast.type === 'success' ? '✅' : toast.type === 'danger' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'} {toast.message}
          </div>
        </div>
      ))}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastOverlay />

        <Routes>
          {/* Public Portal Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicHome />} />
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/volunteers" element={<PublicVolunteers />} />
            <Route path="/collections" element={<PublicCollections />} />
            <Route path="/announcements" element={<PublicAnnouncements />} />
            <Route path="/gallery" element={<PublicGallery />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Committee Dashboard Routes (Protected) */}
          <Route element={<PrivateRoute allowedRoles={['Super Admin', 'Treasurer', 'Event Manager', 'Volunteer Manager', 'Content Manager']} />}>
            <Route element={<CommitteeLayout />}>
              <Route path="/dashboard" element={<CommitteeDashboard />} />
              <Route path="/dashboard/documents" element={<ManageDocuments />} />
            </Route>
          </Route>

          {/* Committee Financial Roles (Super Admin / Treasurer only) */}
          <Route element={<PrivateRoute allowedRoles={['Super Admin', 'Treasurer']} />}>
            <Route element={<CommitteeLayout />}>
              <Route path="/dashboard/collections" element={<ManageCollections />} />
              <Route path="/dashboard/expenses" element={<ManageExpenses />} />
              <Route path="/dashboard/reports" element={<FinancialReports />} />
            </Route>
          </Route>

          {/* Committee Events Roles (Super Admin / Event Manager only) */}
          <Route element={<PrivateRoute allowedRoles={['Super Admin', 'Event Manager']} />}>
            <Route element={<CommitteeLayout />}>
              <Route path="/dashboard/events" element={<ManageEvents />} />
              <Route path="/dashboard/registrations" element={<ManageRegistrations />} />
            </Route>
          </Route>

          {/* Committee Volunteers Roles (Super Admin / Volunteer Manager only) */}
          <Route element={<PrivateRoute allowedRoles={['Super Admin', 'Volunteer Manager']} />}>
            <Route element={<CommitteeLayout />}>
              <Route path="/dashboard/volunteers" element={<ManageVolunteers />} />
            </Route>
          </Route>

          {/* Committee Announcements & Gallery Roles (Super Admin / Content Manager only) */}
          <Route element={<PrivateRoute allowedRoles={['Super Admin', 'Content Manager']} />}>
            <Route element={<CommitteeLayout />}>
              <Route path="/dashboard/announcements" element={<ManageAnnouncements />} />
              <Route path="/dashboard/gallery" element={<ManageGallery />} />
            </Route>
          </Route>

          {/* Super Admin ONLY Controls (Activity history, logins creation, settings configs) */}
          <Route element={<PrivateRoute allowedRoles={['Super Admin']} />}>
            <Route element={<CommitteeLayout />}>
              <Route path="/dashboard/logs" element={<ActivityLog />} />
              <Route path="/dashboard/users" element={<CommitteeUsers />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Redirect missing routes to homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

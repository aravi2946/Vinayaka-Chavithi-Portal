import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, API_URL } from './context/AuthContext';
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
import ManagePrasadam from './pages/ManagePrasadam';

// Public Layout Wrap
const PublicLayout = () => {
  const { settings } = useAuth();
  const year = settings?.festivalYear || 2026;

  return (
    <div>
      <Navbar />
      <main style={{ minHeight: '85vh' }}>
        <Outlet />
      </main>
      <footer style={{ background: 'var(--grad-dark)', color: 'rgba(255,255,255,0.7)', padding: '2.5rem 1.5rem 2rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid hsl(30, 10%, 15%)' }}>
        <p style={{ wordBreak: 'break-word', lineHeight: '1.6', margin: '0 0 0.5rem' }}>
          © {year} {settings?.festivalName || 'Vinayaka Chavithi Festival Committee'}.{' '}
          <span style={{ display: 'inline-block' }}>All rights reserved.</span>
        </p>
        <div style={{ margin: '0.75rem 0 0.85rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255, 102, 0, 0.18), rgba(255, 179, 0, 0.28))', border: '1.5px solid rgba(255, 179, 0, 0.5)', borderRadius: '24px', padding: '0.45rem 1.5rem', color: '#FFE082', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.03em', textShadow: '0 1px 4px rgba(0,0,0,0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            🚩 Event Organized By — Chowdarys, NGPadu
          </div>
        </div>
        <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', wordBreak: 'break-word', lineHeight: '1.6' }}>
          Jai Ganesha. May Lord Ganesha remove all your obstacles and bless you with wisdom, health &amp; prosperity.
        </p>
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

// Global Unique Visitor Tracker (Count unique visitors, not refreshes)
const VisitorTracker = () => {
  useEffect(() => {
    try {
      let visitorId = localStorage.getItem('vc_visitor_uuid');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
        localStorage.setItem('vc_visitor_uuid', visitorId);
      }

      // Ping visitor tracker
      fetch(`${API_URL}/visitors/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      }).catch(() => {});
    } catch (err) {
      // Ignore client tracking error
    }
  }, []);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <VisitorTracker />
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
            <Route path="/documents" element={<PublicDocuments />} />
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

          {/* Prasadam Seva Management (Super Admin / Food Admin only) */}
          <Route element={<PrivateRoute allowedRoles={['Super Admin', 'Food Admin']} />}>
            <Route element={<CommitteeLayout />}>
              <Route path="/dashboard/prasadam" element={<ManagePrasadam />} />
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

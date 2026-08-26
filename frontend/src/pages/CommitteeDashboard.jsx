import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import {
  Coins,
  Receipt,
  Scale,
  Calendar,
  Users,
  Megaphone,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CommitteeDashboard = () => {
  const { user, triggerToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [operationalStats, setOperationalStats] = useState({
    eventsCount: 0,
    volunteersCount: 0,
    announcementsCount: 0,
    registrationsCount: 0,
    pendingRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);

  // Check roles
  const canSeeFinance = ['Super Admin', 'Treasurer'].includes(user.role);

  useEffect(() => {
    fetchOperationalData();
    if (canSeeFinance) {
      fetchFinancialData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFinancialData = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/expenses/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        const data = await res.json();
        triggerToast(data.message || 'Failed to fetch dashboard metrics', 'danger');
      }
    } catch (error) {
      console.error(error);
      triggerToast('Server error loading financial statistics', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchOperationalData = async () => {
    try {
      const token = user.token;
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load events count
      const evtRes = await fetch(`${API_URL}/events`, { headers });
      const evts = evtRes.ok ? await evtRes.json() : [];

      // Load registrations count
      let regs = [];
      if (['Super Admin', 'Event Manager'].includes(user.role)) {
        const regRes = await fetch(`${API_URL}/events/registrations/all`, { headers });
        regs = regRes.ok ? await regRes.json() : [];
      }

      // Load volunteers count
      let vols = [];
      if (['Super Admin', 'Volunteer Manager'].includes(user.role)) {
        const volRes = await fetch(`${API_URL}/volunteers`, { headers });
        vols = volRes.ok ? await volRes.json() : [];
      }

      // Load announcements
      const annRes = await fetch(`${API_URL}/announcements`, { headers });
      const anns = annRes.ok ? await annRes.json() : [];

      setOperationalStats({
        eventsCount: evts.length,
        volunteersCount: vols.length,
        announcementsCount: anns.length,
        registrationsCount: regs.length,
        pendingRegistrations: regs.filter(r => r.registrationStatus === 'Pending').length,
      });
    } catch (error) {
      console.error('Error fetching operational metrics:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Loading dashboard metrics...</div>;
  }

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>👋 Namaste, {user.username}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Role: <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{user.role}</span> | Operations hub for the festival committee.</p>
        </div>
      </div>

      {/* ==============================================================
          FINANCIAL DASHBOARD SECTION (TREASURER & SUPER ADMIN ONLY)
          ============================================================== */}
      {canSeeFinance && stats && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={20} /> Financial Status Summary
          </h2>

          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <DashboardCard
              title="Total Collections"
              value={`₹${stats.totalCollections.toLocaleString('en-IN')}`}
              icon={<Coins size={24} />}
              colorClass="btn-success"
              description={`Active Donors: ${stats.donorCount}`}
            />
            <DashboardCard
              title="Total Expenses"
              value={`₹${stats.totalExpenses.toLocaleString('en-IN')}`}
              icon={<Receipt size={24} />}
              colorClass="btn-danger"
              description={`Includes approved expenses`}
            />
            <DashboardCard
              title="Remaining Balance"
              value={`₹${stats.remainingBalance.toLocaleString('en-IN')}`}
              icon={<Scale size={24} />}
              colorClass="btn-primary"
              description="Current available cash reserves"
            />
          </div>

          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S DONATIONS</span>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
                ₹{stats.todayCollections.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>THIS MONTH'S DONATIONS</span>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
                ₹{stats.monthlyCollections.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>THIS MONTH'S EXPENSES</span>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>
                ₹{stats.monthlyExpenses.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Budget vs Actual Tracker */}
          <div className="card" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>📊 Spending Target Tracker (Budget vs Actual)</h2>
              <Link to="/dashboard/expenses" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Manage Budget & Expenses <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid-2">
              {stats.budgetVsActual.slice(0, 6).map((b) => (
                <div key={b.category} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span>{b.category}</span>
                    <span>
                      ₹{b.actual.toLocaleString('en-IN')} / ₹{b.budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="budget-progress-container">
                    <div className="budget-progress-bar">
                      <div
                        className={`budget-progress-fill ${b.percentUsed > 100 ? 'over-budget' : ''}`}
                        style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                      ></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                      <span>{b.percentUsed}% utilized</span>
                      {b.percentUsed > 100 ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                          <AlertTriangle size={12} /> Over Budget by ₹{Math.abs(b.remaining).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span>₹{b.remaining.toLocaleString('en-IN')} available</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          OPERATIONAL METRICS SECTION (ALL COMMITTEE ROLES)
          ============================================================== */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={20} /> Operational Metrics & Quick Actions
        </h2>

        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <Calendar size={20} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Events Scheduled</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{operationalStats.eventsCount}</span>
            </div>
          </div>

          {['Super Admin', 'Event Manager'].includes(user.role) && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 120, 0, 0.1)', color: 'var(--secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <UserCheck size={20} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Registrations</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                  {operationalStats.registrationsCount} ({operationalStats.pendingRegistrations} pending)
                </span>
              </div>
            </div>
          )}

          {['Super Admin', 'Volunteer Manager'].includes(user.role) && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(0, 150, 255, 0.1)', color: 'var(--info)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <Users size={20} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Volunteers</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{operationalStats.volunteersCount}</span>
              </div>
            </div>
          )}

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(0, 200, 100, 0.1)', color: 'var(--success)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <Megaphone size={20} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Announcements</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{operationalStats.announcementsCount}</span>
            </div>
          </div>
        </div>

        {/* Quick Task Guidelines */}
        <div className="card card-festive-border">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>📌 Role-Based Checklist</h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {user.role === 'Super Admin' && (
              <>
                <li>As <strong>Super Admin</strong>, you have complete visibility. You can configure the global settings (year, banner details, toggles) and create/manage committee logins.</li>
                <li>Verify the Audit Logs tab periodically to view full mutation histories and soft-deleted collections/expenses.</li>
              </>
            )}
            {user.role === 'Treasurer' && (
              <>
                <li>Add collection entries as they occur. For UPI or Bank Transfers, insert transaction codes to flag duplicate entries.</li>
                <li>Log bills and receipts for puja items, pandal rentals, and Annadanam food prep. Ensure all expenses are cataloged and approved to reflect in financial targets.</li>
              </>
            )}
            {user.role === 'Event Manager' && (
              <>
                <li>Manage kids drawing/sloka competitions, specify maximum limits of entries, and toggle <strong>Registration Required</strong> properties.</li>
                <li>Go to the Registrations tab to review and approve child submissions.</li>
              </>
            )}
            {user.role === 'Volunteer Manager' && (
              <>
                <li>Register volunteers, review their availability timelines, and map them to responsibilities (Food prep, decorations assembly, security crowd control).</li>
              </>
            )}
            {user.role === 'Content Manager' && (
              <>
                <li>Post alerts about puja Aarti timings or processional route updates.</li>
                <li>Upload gallery pictures under specific albums (Annadanam, Sthapana, Nimajjanam).</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;

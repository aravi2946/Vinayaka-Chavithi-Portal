import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Coins,
  Receipt,
  Calendar,
  Users,
  Megaphone,
  Image as ImageIcon,
  FileText,
  History,
  ShieldCheck,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  UserCheck
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout, settings } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper to determine if a link should be shown based on role
  const showLink = (allowedRoles) => {
    return allowedRoles.includes(user.role);
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      roles: ['Super Admin', 'Treasurer', 'Event Manager', 'Volunteer Manager', 'Content Manager'],
    },
    {
      path: '/dashboard/collections',
      label: 'Collections',
      icon: <Coins size={18} />,
      roles: ['Super Admin', 'Treasurer'],
    },
    {
      path: '/dashboard/expenses',
      label: 'Expenses',
      icon: <Receipt size={18} />,
      roles: ['Super Admin', 'Treasurer'],
    },
    {
      path: '/dashboard/events',
      label: 'Events',
      icon: <Calendar size={18} />,
      roles: ['Super Admin', 'Event Manager'],
    },
    {
      path: '/dashboard/registrations',
      label: 'Registrations',
      icon: <UserCheck size={18} />,
      roles: ['Super Admin', 'Event Manager'],
    },
    {
      path: '/dashboard/volunteers',
      label: 'Volunteers',
      icon: <Users size={18} />,
      roles: ['Super Admin', 'Volunteer Manager'],
    },
    {
      path: '/dashboard/announcements',
      label: 'Announcements',
      icon: <Megaphone size={18} />,
      roles: ['Super Admin', 'Content Manager'],
    },
    {
      path: '/dashboard/gallery',
      label: 'Gallery',
      icon: <ImageIcon size={18} />,
      roles: ['Super Admin', 'Content Manager'],
    },
    {
      path: '/dashboard/documents',
      label: 'Documents',
      icon: <FileText size={18} />,
      roles: ['Super Admin', 'Treasurer', 'Event Manager', 'Volunteer Manager', 'Content Manager'],
    },
    {
      path: '/dashboard/reports',
      label: 'Financial Reports',
      icon: <FileText size={18} />,
      roles: ['Super Admin', 'Treasurer'],
    },
    {
      path: '/dashboard/logs',
      label: 'Activity History',
      icon: <History size={18} />,
      roles: ['Super Admin'],
    },
    {
      path: '/dashboard/users',
      label: 'Committee Users',
      icon: <ShieldCheck size={18} />,
      roles: ['Super Admin'],
    },
    {
      path: '/dashboard/settings',
      label: 'Festival Settings',
      icon: <SettingsIcon size={18} />,
      roles: ['Super Admin'],
    },
  ];

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <span style={{ fontSize: '1.5rem' }}>🕉️</span>
        <div>
          <h2>Festival Portal</h2>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block' }}>
            {settings.festivalYear} celebration
          </span>
        </div>
      </div>

      <div className="sidebar-menu">
        <NavLink to="/" className="sidebar-link" onClick={() => setMobileOpen(false)}>
          <ArrowLeft size={18} />
          Back to Public Site
        </NavLink>
        
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.5rem 0' }}></div>

        {menuItems.map(
          (item) =>
            showLink(item.roles) && (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            )
        )}
      </div>

      <div className="sidebar-user">
        <span className="username">@{user.username}</span>
        <span className="role">{user.role}</span>
        <button onClick={handleLogout} className="btn btn-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(0, 80%, 75%)', marginTop: '0.75rem', fontSize: '0.85rem' }}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

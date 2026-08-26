import React from 'react';

const DashboardCard = ({ title, value, icon, colorClass, description }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass || 'btn-primary'}`}>
        {icon}
      </div>
      <div className="stat-details">
        <h3>{title}</h3>
        <div className="value">{value}</div>
        {description && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</span>}
      </div>
    </div>
  );
};

export default DashboardCard;

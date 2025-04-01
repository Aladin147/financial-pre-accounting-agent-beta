import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Application sidebar navigation component
 * 
 * Provides navigation to the main sections of the application
 */
function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink to="/documents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">📁</span>
              <span>Document Manager</span>
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink to="/tax-calculator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">🧮</span>
              <span>Tax Calculator</span>
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">📋</span>
              <span>Reports</span>
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">⚙️</span>
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="nav-item">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            window.electronAPI.viewLogs();
          }} className="nav-link">
            <span className="nav-icon">📝</span>
            <span>View Logs</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

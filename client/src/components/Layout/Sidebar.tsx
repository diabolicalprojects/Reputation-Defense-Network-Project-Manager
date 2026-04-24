import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Palette,
  Code2,
  History,
  LogOut,
  Shield,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
      isActive
        ? 'bg-brand-600/20 text-brand-400 shadow-lg shadow-brand-600/5'
        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/80'
    }`;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-surface-900/95 backdrop-blur-xl border-r border-surface-700/50 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-surface-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">RDN Manager</h1>
              <p className="text-[10px] text-surface-500 uppercase tracking-widest">Project Pipeline</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden p-2 text-surface-400 hover:text-white">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-600 px-3 mb-2 mt-2">
            Main
          </p>

          {user?.role === 'PM' && (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={() => onClose()}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Kanban Board</span>
              </NavLink>
              <NavLink to="/clients" className={linkClass} onClick={() => onClose()}>
                <Users className="w-4 h-4" />
                <span>Clients</span>
              </NavLink>
              <NavLink to="/team" className={linkClass} onClick={() => onClose()}>
                <FolderKanban className="w-4 h-4" />
                <span>Team</span>
              </NavLink>
              <NavLink to="/settings" className={linkClass} onClick={() => onClose()}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
            </>
          )}

          {(user?.role === 'DESIGNER' || user?.role === 'BOTH') && (
            <NavLink to="/designer" className={linkClass} onClick={() => onClose()}>
              <Palette className="w-4 h-4" />
              <span>Design Queue</span>
            </NavLink>
          )}

          {(user?.role === 'DEVELOPER' || user?.role === 'BOTH') && (
            <NavLink to="/developer" className={linkClass} onClick={() => onClose()}>
              <Code2 className="w-4 h-4" />
              <span>Dev Queue</span>
            </NavLink>
          )}

          <NavLink to="/history" className={linkClass} onClick={() => onClose()}>
            <History className="w-4 h-4" />
            <span>History</span>
          </NavLink>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-surface-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-surface-500 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-ghost flex items-center gap-2 justify-center text-surface-500 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};


export default Sidebar;

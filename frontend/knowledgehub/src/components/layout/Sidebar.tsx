import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Folder,
  Search,
  Tag,
  Plus,
  LogOut,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, openQuickCapture } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Knowledge Library', path: '/library', icon: Folder },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Topics & Tags', path: '/topics', icon: Tag },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#11151B] border-r border-[#222733] flex flex-col justify-between transition-transform duration-200 ease-in-out
          md:translate-x-0 md:static md:z-0
          ${isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div>
          {/* Header */}
          <div className="p-4 border-b border-[#222733] flex items-center justify-between">
            <Logo size="sm" />
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#F3F4F6] md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Capture Button */}
          <div className="p-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                openQuickCapture();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-xs shadow-indigo-600/30 border border-indigo-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Quick Capture</span>
              <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-indigo-700/60 px-1.5 py-0.5 rounded border border-indigo-400/30 text-indigo-100 font-mono">
                ⌘C
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 shadow-xs'
                        : 'text-[#94A3B8] hover:bg-[#171B22] hover:text-[#F3F4F6] border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[#222733] space-y-3 bg-[#0E1217]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 font-bold text-xs flex items-center justify-center">
              {(user?.fullName || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#F3F4F6] truncate">
                {user?.fullName || 'Alex Developer'}
              </p>
              <p className="text-[11px] text-[#64748B] truncate font-mono">{user?.email || 'alex@knowledgehub.io'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

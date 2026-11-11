import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Folder, Plus, Tag, MoreHorizontal, LogOut, User, Search, RefreshCw, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, openQuickCapture } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { label: 'Library', path: '/library', icon: Folder },
    { label: 'Capture', action: openQuickCapture, isAction: true },
    { label: 'Topics', path: '/topics', icon: Tag },
    { label: 'More', action: () => setIsMoreOpen(true), isMore: true, icon: MoreHorizontal },
  ];

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 bg-[#0E1217]/95 backdrop-blur-md border-t border-[#222733] z-30 md:hidden">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
          {navItems.map((item, index) => {
            if (item.isAction) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center justify-center -mt-5 focus:outline-none group cursor-pointer"
                  aria-label="Quick capture"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-600 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-500/40 transition-transform active:scale-95">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </button>
              );
            }

            const Icon = item.icon!;
            const isActive = item.path ? location.pathname === item.path : false;

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (item.path) navigate(item.path);
                  if (item.action) item.action();
                }}
                className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-[#64748B] hover:text-[#CBD5E1]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                <span className={`text-[11px] mt-1 font-medium ${isActive ? 'font-semibold text-indigo-300' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* "More" Sheet Modal */}
      <Modal isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title="Account & Preferences" maxWidth="sm">
        <div className="space-y-4">
          <div className="p-3 bg-[#171B22] rounded-lg border border-[#222733] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 flex items-center justify-center font-bold text-sm">
              {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#F3F4F6] truncate">
                {user?.fullName || 'Alex Developer'}
              </p>
              <p className="text-[11px] text-[#64748B] font-mono truncate">{user?.email || 'alex@knowledgehub.io'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(false);
                navigate('/search');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#CBD5E1] hover:bg-[#171B22] hover:text-white font-medium text-left transition-colors"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Search Knowledge (⌘K)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(false);
                navigate('/topics');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#CBD5E1] hover:bg-[#171B22] hover:text-white font-medium text-left transition-colors"
            >
              <Tag className="w-4 h-4 text-indigo-400" />
              <span>Browse by Topic & Tags</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#222733]">
            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(false);
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/30 hover:text-red-300 font-medium text-left transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

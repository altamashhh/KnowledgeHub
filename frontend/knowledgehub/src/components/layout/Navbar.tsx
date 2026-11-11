import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ArrowLeft, Plus, LogOut, User as UserIcon } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  title,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, openQuickCapture } = useAuth();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const isSearchPage = location.pathname === '/search';

  return (
    <header className="sticky top-0 z-30 bg-[#0B0D10]/90 backdrop-blur-md border-b border-[#222733]">
      <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between">
        {/* Left item */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 -ml-1.5 rounded-lg text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B22] focus:outline-none transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 -ml-1.5 rounded-lg text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B22] md:hidden focus:outline-none transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-indigo-400" />
            </button>
          )}

          {/* Desktop Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            className="hidden md:flex items-center cursor-pointer"
          >
            <Logo size="sm" />
          </div>
        </div>

        {/* Center item: Mobile Logo or Page Title */}
        <div className="flex items-center justify-center flex-1 md:flex-none">
          {title ? (
            <h1 className="text-sm font-semibold text-[#F3F4F6] tracking-tight truncate">{title}</h1>
          ) : (
            <div
              onClick={() => navigate('/dashboard')}
              className="flex md:hidden items-center cursor-pointer"
            >
              <span className="text-base font-bold tracking-tight text-[#F3F4F6]">
                Knowledge<span className="text-indigo-400">Hub</span>
              </span>
            </div>
          )}
        </div>

        {/* Right item */}
        <div className="flex items-center gap-2">
          {rightAction ? (
            rightAction
          ) : (
            <>
              {!isSearchPage && (
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#11151B] border border-[#222733] text-xs text-[#94A3B8] hover:text-[#F3F4F6] hover:border-[#333B4D] focus:outline-none transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Search...</span>
                  <kbd className="hidden sm:inline-block text-[10px] bg-[#171B22] px-1.5 py-0.5 rounded border border-[#2A313D] text-[#64748B] font-mono">
                    ⌘K
                  </kbd>
                </button>
              )}

              <button
                type="button"
                onClick={openQuickCapture}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs shadow-indigo-600/30 border border-indigo-500/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Capture</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

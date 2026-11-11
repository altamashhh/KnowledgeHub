import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { QuickCaptureModal } from '../knowledge/QuickCaptureModal';
import { BackendStatusBanner } from '../common/BackendStatusBanner';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { openQuickCapture } = useAuth();
  const navigate = useNavigate();

  // Global hotkey listeners for developer experience (Cmd+K / Ctrl+K for search, Alt+C for capture)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        openQuickCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, openQuickCapture]);

  return (
    <div className="min-h-screen bg-[#0B0D10] flex flex-col antialiased text-[#F3F4F6]">
      {/* Backend Status indicator */}
      <BackendStatusBanner />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8 bg-[#0B0D10]">
          {/* Top Navbar */}
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Wide Workspace Layout Container */}
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Quick Capture Modal */}
      <QuickCaptureModal />
    </div>
  );
};

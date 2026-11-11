import React, { useState } from 'react';
import { Server, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { API_BASE_URL } from '../../api/client';
import { getBackendStatus } from '../../api/service';

export const BackendStatusBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { isLive } = getBackendStatus();

  if (dismissed) return null;

  const testConnection = async () => {
    setIsChecking(true);
    try {
      await fetch(`${API_BASE_URL}/api/v1/items?size=1`, { method: 'GET' });
      // reload to reflect live state
      window.location.reload();
    } catch {
      setIsChecking(false);
    }
  };

  return (
    <div
      className={`text-xs py-1.5 px-4 flex items-center justify-between transition-colors border-b ${
        isLive
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
          : 'bg-[#0E1217] text-[#94A3B8] border-[#222733]'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex h-2 w-2 relative flex-shrink-0">
          {isLive ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          )}
        </span>
        <span className="truncate font-medium text-xs">
          {isLive ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-400" />
              Connected to Spring Boot API: <code className="text-[11px] font-mono text-emerald-300">{API_BASE_URL}</code>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 inline text-indigo-400" />
              Target Backend: <code className="text-[11px] font-mono text-indigo-300">{API_BASE_URL}</code>
              <span className="text-[#64748B] text-[11px] hidden sm:inline">
                (Spring Boot REST API)
              </span>
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
        <button
          type="button"
          onClick={testConnection}
          disabled={isChecking}
          className="hover:underline flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
          title="Retry backend connection"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking...' : 'Check API'}</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-[#64748B] hover:text-[#94A3B8] p-0.5 rounded-sm"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

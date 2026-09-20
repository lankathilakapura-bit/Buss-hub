import React, { useState } from 'react';
import { FULL_APPS_SCRIPT_CODE } from '../data/appsScriptCode';
import { 
  Code2, 
  Copy, 
  Check, 
  Clock, 
  Mail, 
  Calendar, 
  Menu, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const AppsScriptStudio: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeModule, setActiveModule] = useState<'all' | 'onEdit' | 'alerts' | 'archive' | 'menu'>('all');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(FULL_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-900/40 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>Google Apps Script (GAS) Automation Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Automated Timestamping, Discrepancy Alerts & Archival
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Zero-maintenance serverless script that turns your standard Google Sheet into an intelligent school transit dispatcher with automated alerts.
            </p>
          </div>

          <button
            id="btn-copy-full-script"
            onClick={handleCopyScript}
            className="self-start lg:self-center px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Full Script (Code.gs)!' : 'Copy Entire Code.gs Script'}</span>
          </button>
        </div>
      </div>

      {/* Feature Modules Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveModule('onEdit')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeModule === 'onEdit'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Auto-Timestamping</h3>
          <p className="text-xs text-slate-600 mt-1">
            When drivers mark "Boarded", auto-records current time in Col H so drivers never type times.
          </p>
          <span className="text-[10px] font-mono text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded mt-2.5 inline-block">
            function onEdit(e)
          </span>
        </div>

        <div
          onClick={() => setActiveModule('alerts')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeModule === 'alerts'
              ? 'bg-red-50 border-red-400 ring-2 ring-red-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center mb-3">
            <Mail className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Safety Email Dispatcher</h3>
          <p className="text-xs text-slate-600 mt-1">
            Scans attendance and dispatches instant urgent email if a child boarded the bus but was marked absent.
          </p>
          <span className="text-[10px] font-mono text-red-700 bg-red-100/60 px-1.5 py-0.5 rounded mt-2.5 inline-block">
            sendDiscrepancyAlerts()
          </span>
        </div>

        <div
          onClick={() => setActiveModule('archive')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeModule === 'archive'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Daily Archival & Reset</h3>
          <p className="text-xs text-slate-600 mt-1">
            Clones completed sheet to permanent historical archive and clears statuses for the next school day.
          </p>
          <span className="text-[10px] font-mono text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded mt-2.5 inline-block">
            archiveTodayAttendance()
          </span>
        </div>

        <div
          onClick={() => setActiveModule('menu')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeModule === 'menu'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <Menu className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Sheets Custom Menu</h3>
          <p className="text-xs text-slate-600 mt-1">
            Creates a top-level "🚌 Transit Tracker" menu inside Google Sheets with one-click administrative actions.
          </p>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded mt-2.5 inline-block">
            function onOpen()
          </span>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-md overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="font-mono text-xs text-slate-300 font-semibold ml-2">
              Code.gs — Google Apps Script
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto max-h-[500px]">
          <pre className="text-slate-300 font-mono text-xs leading-relaxed whitespace-pre">
            {FULL_APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>

      {/* Installation Walkthrough */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <span>How to Install in Your Google Sheet (2 Minutes)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
              <span>Open Apps Script</span>
            </div>
            <p className="text-slate-600">
              In your Google Sheet, navigate to the top toolbar menu: <strong>Extensions &gt; Apps Script</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
              <span>Paste Code.gs</span>
            </div>
            <p className="text-slate-600">
              Clear any placeholder code inside <code className="text-indigo-800 bg-indigo-50 px-1 py-0.5 rounded">Code.gs</code> and paste the copied script above.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
              <span>Update Email</span>
            </div>
            <p className="text-slate-600">
              In line 16, replace <code className="text-indigo-800 bg-indigo-50 px-1 py-0.5 rounded">CONFIG.ADMIN_EMAIL</code> with your school office or principal's email address.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">4</span>
              <span>Save & Reload</span>
            </div>
            <p className="text-slate-600">
              Press <strong>Ctrl+S</strong> (or Cmd+S) to save. Reload your spreadsheet tab. The <strong>🚌 Transit Tracker</strong> menu will appear instantly!
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>First-Time Authorization:</strong> The first time you run an action from the menu, Google Sheets will prompt you to authorize permissions for email notifications and spreadsheet edits. Click "Advanced" &gt; "Go to School Transit Script (unsafe)" &gt; "Allow".
          </span>
        </div>
      </div>
    </div>
  );
};

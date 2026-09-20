import React from 'react';
import { Bus, ShieldAlert, Sparkles, FileSpreadsheet, Code2, BookOpen, CheckCircle2, HeartHandshake, Columns, Radio, Map } from 'lucide-react';

interface NavbarProps {
  activeTab: 'bus' | 'parent' | 'split' | 'map' | 'tracker' | 'schema' | 'formulas' | 'script' | 'guide';
  setActiveTab: (tab: 'bus' | 'parent' | 'split' | 'map' | 'tracker' | 'schema' | 'formulas' | 'script' | 'guide') => void;
  criticalAlertsCount: number;
  totalStudents: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  criticalAlertsCount,
  totalStudents
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">TransitTrack</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Bus & Parents Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                1st Page for Bus · 2nd Page for Parents
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs: 1st Page (Bus), 2nd Page (Parents) */}
          <nav className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/70 overflow-x-auto">
            {/* 1st Page: Bus */}
            <button
              id="nav-tab-bus"
              onClick={() => setActiveTab('bus')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
                activeTab === 'bus'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
              }`}
              title="1 වන පිටුව: පාසල් බස් රථයේ සහ වෑන් රථයේ සටහන් (Bus Page)"
            >
              <span className="w-4 h-4 rounded-full bg-slate-950/20 text-current flex items-center justify-center text-[11px] font-black">
                1
              </span>
              <Bus className="w-4 h-4" />
              <span>1st Page: The Bus (බස් රථය)</span>
            </button>

            {/* 2nd Page: Parents */}
            <button
              id="nav-tab-parent"
              onClick={() => setActiveTab('parent')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
                activeTab === 'parent'
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                  : 'bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30'
              }`}
              title="2 වන පිටුව: දෙමාපියන්ගේ සජීවී පිටුව (Parents Page)"
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-current flex items-center justify-center text-[11px] font-black">
                2
              </span>
              <HeartHandshake className="w-4 h-4" />
              <span>2nd Page: Parents (දෙමාපියන්)</span>
            </button>

            {/* Side-by-Side Dual View */}
            <button
              id="nav-tab-split"
              onClick={() => setActiveTab('split')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'split'
                  ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="දෙපැත්තම එක ළඟ (Side-by-Side View)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Side-by-Side</span>
            </button>

            {/* Live GPS Bus Map (PickMe Style) */}
            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
              }`}
              title="සජීවී බස් සිතියම - Live GPS Bus Map (PickMe style live van tracking)"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Bus Map</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-0.5 hidden lg:block" />

            {/* Live Tracker */}
            <button
              id="nav-tab-tracker"
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'tracker'
                  ? 'bg-slate-700 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Master Tracker</span>
              {criticalAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                  {criticalAlertsCount}
                </span>
              )}
            </button>

            {/* Schema / Apps Script */}
            <button
              id="nav-tab-script"
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'script' || activeTab === 'schema' || activeTab === 'formulas' || activeTab === 'guide'
                  ? 'bg-slate-700 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Apps Script</span>
            </button>
          </nav>

          {/* Right Status Badge */}
          <div className="hidden lg:flex items-center gap-3">
            {criticalAlertsCount > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-xs">
                <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
                <span className="font-semibold">{criticalAlertsCount} Safety Discrepancy!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All {totalStudents} Accounted</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

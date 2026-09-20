import React, { useState } from 'react';
import { 
  StudentTransitRecord, 
  RouteInfo, 
  MorningBusStatus, 
  SchoolPresenceStatus, 
  EveningBusStatus 
} from '../types';
import { 
  computeUnifiedStatus 
} from '../data/initialData';
import { 
  Bus, 
  School, 
  Home, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Phone, 
  Clock, 
  UserPlus, 
  Filter, 
  RefreshCw, 
  Check, 
  Sparkles,
  Info,
  Smartphone,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  User
} from 'lucide-react';

interface LiveTrackerProps {
  records: StudentTransitRecord[];
  routes: RouteInfo[];
  onUpdateRecord: (updated: StudentTransitRecord) => void;
  onBatchUpdate: (updater: (rec: StudentTransitRecord) => StudentTransitRecord) => void;
  onOpenAddModal: () => void;
  onSelectStudent: (record: StudentTransitRecord) => void;
  onOpenRouteManager?: () => void;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({
  records,
  routes,
  onUpdateRecord,
  onBatchUpdate,
  onOpenAddModal,
  onSelectStudent,
  onOpenRouteManager
}) => {
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showMobileHelp, setShowMobileHelp] = useState<boolean>(false);

  // Metrics
  const totalStudents = records.length;
  const morningBoardedCount = records.filter(r => r.morningBusStatus === 'Boarded').length;
  const schoolPresentCount = records.filter(r => r.schoolStatus === 'Present' || r.schoolStatus === 'Tardy').length;
  const eveningSafeCount = records.filter(r => r.eveningBusStatus === 'Boarded Bus' || r.eveningBusStatus === 'Parent Pickup').length;
  
  const criticalDiscrepancies = records.filter(
    r => r.unifiedStatus === 'CRITICAL: Boarded Bus but Missing at School'
  );
  const transitMismatches = records.filter(
    r => r.unifiedStatus === 'Transit Discrepancy: Skipped Bus but Present' || 
         r.unifiedStatus === 'PM Attention: Present but Unaccounted for PM'
  );

  // Filter records
  const filteredRecords = records.filter(record => {
    if (selectedRoute !== 'all' && record.routeNumber !== selectedRoute) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = record.name.toLowerCase().includes(q);
      const matchId = record.studentId.toLowerCase().includes(q);
      const matchStop = record.busStop.toLowerCase().includes(q);
      const matchGrade = record.grade.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchStop && !matchGrade) return false;
    }
    if (statusFilter === 'critical') {
      return record.unifiedStatus === 'CRITICAL: Boarded Bus but Missing at School';
    }
    if (statusFilter === 'mismatches') {
      return record.unifiedStatus.includes('Discrepancy') || record.unifiedStatus.includes('Attention');
    }
    if (statusFilter === 'morning_boarded') {
      return record.morningBusStatus === 'Boarded';
    }
    if (statusFilter === 'school_absent') {
      return record.schoolStatus === 'Absent';
    }
    return true;
  });

  const handleMorningStatusChange = (record: StudentTransitRecord, newStatus: MorningBusStatus) => {
    const now = new Date();
    const timeStr = newStatus === 'Boarded' 
      ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : record.morningPickupTime;

    const newUnified = computeUnifiedStatus(newStatus, record.schoolStatus, record.eveningBusStatus, record.eveningDropTime);
    onUpdateRecord({
      ...record,
      morningBusStatus: newStatus,
      morningPickupTime: newStatus === 'Boarded' ? (record.morningPickupTime || timeStr) : (newStatus === 'Absent' ? '' : record.morningPickupTime),
      unifiedStatus: newUnified
    });
  };

  const handleSchoolStatusChange = (record: StudentTransitRecord, newStatus: SchoolPresenceStatus) => {
    const now = new Date();
    const timeStr = (newStatus === 'Present' || newStatus === 'Tardy')
      ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : record.schoolCheckTime;

    const newUnified = computeUnifiedStatus(record.morningBusStatus, newStatus, record.eveningBusStatus, record.eveningDropTime);
    onUpdateRecord({
      ...record,
      schoolStatus: newStatus,
      schoolCheckTime: (newStatus === 'Present' || newStatus === 'Tardy') ? (record.schoolCheckTime || timeStr) : '',
      unifiedStatus: newUnified
    });
  };

  const handleEveningStatusChange = (record: StudentTransitRecord, newStatus: EveningBusStatus) => {
    const now = new Date();
    const timeStr = newStatus === 'Boarded Bus' 
      ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : record.eveningDropTime;

    const newUnified = computeUnifiedStatus(record.morningBusStatus, record.schoolStatus, newStatus, timeStr);
    onUpdateRecord({
      ...record,
      eveningBusStatus: newStatus,
      eveningDropTime: newStatus === 'Boarded Bus' ? (record.eveningDropTime || timeStr) : record.eveningDropTime,
      unifiedStatus: newUnified
    });
  };

  const handleMarkAllBoardedForRoute = () => {
    if (selectedRoute === 'all') {
      alert('Please select a specific Bus Route from the filter to batch-mark passengers.');
      return;
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onBatchUpdate(rec => {
      if (rec.routeNumber === selectedRoute && rec.morningBusStatus === 'Pending') {
        const unified = computeUnifiedStatus('Boarded', rec.schoolStatus, rec.eveningBusStatus, rec.eveningDropTime);
        return {
          ...rec,
          morningBusStatus: 'Boarded',
          morningPickupTime: timeStr,
          unifiedStatus: unified
        };
      }
      return rec;
    });
  };

  const handleResetMorningRoute = () => {
    onBatchUpdate(rec => {
      if (selectedRoute === 'all' || rec.routeNumber === selectedRoute) {
        const unified = computeUnifiedStatus('Pending', 'Pending', 'Pending', undefined);
        return {
          ...rec,
          morningBusStatus: 'Pending',
          morningPickupTime: '',
          schoolStatus: 'Pending',
          schoolCheckTime: '',
          eveningBusStatus: 'Pending',
          eveningDropTime: '',
          unifiedStatus: unified
        };
      }
      return rec;
    });
  };

  return (
    <div className="space-y-6">
      {/* Critical Safety Alert Banner */}
      {criticalDiscrepancies.length > 0 && (
        <div className="p-4 bg-red-50 border-2 border-red-500/80 rounded-2xl shadow-sm text-red-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-600 text-white rounded-xl shadow-sm">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base text-red-950 flex items-center gap-2">
                  <span>URGENT: {criticalDiscrepancies.length} Student Transit Discrepancy Detected</span>
                  <span className="text-xs uppercase tracking-wider bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-semibold">
                    Immediate Action
                  </span>
                </h3>
                <p className="text-sm text-red-800 mt-0.5">
                  Student(s) boarded morning bus transit but were marked <strong>Absent</strong> in classroom homeroom attendance!
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {criticalDiscrepancies.map(d => (
                    <button
                      key={d.id}
                      onClick={() => onSelectStudent(d)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-300 rounded-lg text-xs font-medium text-red-900 hover:bg-red-50 shadow-xs"
                    >
                      <span className="font-bold">{d.name}</span>
                      <span className="text-red-700">({d.routeNumber})</span>
                      <span className="text-slate-500">· Pickup: {d.morningPickupTime}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setStatusFilter('critical')}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Filter Critical Only
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Roster</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500">Students</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Bus className="w-3 h-3 text-slate-400" />
            <span>Across {routes.length} Active Routes</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-amber-700 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
            <Bus className="w-3.5 h-3.5" />
            <span>AM Bus Boarded</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-900">{morningBoardedCount}</span>
            <span className="text-xs font-semibold text-amber-700">
              {Math.round((morningBoardedCount / (totalStudents || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Morning transit pickup</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-blue-700 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
            <School className="w-3.5 h-3.5" />
            <span>School Presence</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-900">{schoolPresentCount}</span>
            <span className="text-xs font-semibold text-blue-700">
              {Math.round((schoolPresentCount / (totalStudents || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Classroom check-in</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-emerald-700 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>PM Safe Dismissal</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-900">{eveningSafeCount}</span>
            <span className="text-xs font-semibold text-emerald-700">
              {Math.round((eveningSafeCount / (totalStudents || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Bus drop or parent pickup</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="text-red-700 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Discrepancies</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${criticalDiscrepancies.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {criticalDiscrepancies.length + transitMismatches.length}
            </span>
            <span className="text-xs text-red-700 font-medium">
              {criticalDiscrepancies.length} Critical
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Auto-flagged by formula</div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search & Filter selections */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student, ID, stop, grade..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Route Selector & Bus Manager */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-slate-500">Route:</span>
              <select
                value={selectedRoute}
                onChange={e => setSelectedRoute(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                <option value="all">All Bus Routes ({records.length})</option>
                {routes.map(rt => {
                  const count = records.filter(r => r.routeNumber === rt.routeNumber).length;
                  return (
                    <option key={rt.routeNumber} value={rt.routeNumber}>
                      {rt.routeNumber} - {rt.routeName} ({count})
                    </option>
                  );
                })}
              </select>

              {onOpenRouteManager && (
                <button
                  type="button"
                  onClick={onOpenRouteManager}
                  className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Add, edit, or delete school bus routes and driver details"
                >
                  <Bus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Edit Buses</span>
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="critical">🚨 Critical Discrepancies ({criticalDiscrepancies.length})</option>
                <option value="mismatches">⚠️ Any Transit Mismatch ({criticalDiscrepancies.length + transitMismatches.length})</option>
                <option value="morning_boarded">AM Bus Boarded ({morningBoardedCount})</option>
                <option value="school_absent">School Absent</option>
              </select>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile-friendly Driver Cards with large tap buttons"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>Driver Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Full Spreadheet Table view"
              >
                <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Full Table</span>
              </button>
            </div>

            <button
              onClick={() => setShowMobileHelp(true)}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 border border-blue-200 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone Guide</span>
            </button>

            {selectedRoute !== 'all' && (
              <button
                id="btn-batch-board"
                onClick={handleMarkAllBoardedForRoute}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                title="Mark all pending students on this route as Boarded with current timestamp"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark {selectedRoute} Boarded</span>
              </button>
            )}

            <button
              id="btn-add-student"
              onClick={onOpenAddModal}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>

            <button
              id="btn-reset-route"
              onClick={handleResetMorningRoute}
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs rounded-lg flex items-center gap-1 transition-colors"
              title="Reset records to pending status for testing"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Legend bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Formula Color Rules:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Critical Discrepancy (Boarded bus, missing school)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Transit Mismatch (Skipped bus / PM attention)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Safe & Reconciled</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Full Absence / Pending</span>
          </span>
        </div>
      </div>

      {/* View Switch: Cards vs Table */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>Mobile Driver Cards ({filteredRecords.length} students)</span>
            </span>
            <span className="text-[11px] text-slate-500">
              One-tap buttons optimized for phones and tablets
            </span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
              <Bus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-sm">No students match your filter criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing search or route filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map(record => {
                const isCritical = record.unifiedStatus === 'CRITICAL: Boarded Bus but Missing at School';
                const isMismatch = record.unifiedStatus.includes('Discrepancy') || record.unifiedStatus.includes('Attention');
                const isSafeDrop = record.unifiedStatus === 'Safe Home Drop-Off';

                return (
                  <div
                    key={record.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all space-y-3.5 ${
                      isCritical
                        ? 'border-red-400 bg-red-50/40 ring-2 ring-red-400/20'
                        : isMismatch
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Card Header: Student & Route */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <button
                          onClick={() => onSelectStudent(record)}
                          className="font-bold text-slate-900 text-sm hover:text-amber-600 transition-colors text-left flex items-center gap-1.5"
                        >
                          <span>{record.name}</span>
                          {isCritical && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                          )}
                        </button>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 border border-slate-200">
                            {record.studentId}
                          </span>
                          <span>· {record.grade}</span>
                          <span>· {record.homeroom}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-medium flex items-center gap-1">
                          <span className="text-slate-400">Stop:</span>
                          <span className="truncate max-w-[220px]">{record.busStop}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                          {record.routeNumber}
                        </span>
                      </div>
                    </div>

                    {/* Morning Bus Pickup: Big Thumb Buttons */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                        <span className="flex items-center gap-1">
                          <Bus className="w-3.5 h-3.5 text-amber-600" />
                          <span>Morning Bus Transit:</span>
                        </span>
                        {record.morningPickupTime ? (
                          <span className="font-mono text-amber-800 text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">
                            {record.morningPickupTime}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Tap to mark</span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMorningStatusChange(record, 'Boarded')}
                          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                            record.morningBusStatus === 'Boarded'
                              ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-600/30 font-extrabold'
                              : 'bg-slate-100 hover:bg-amber-100 text-slate-700'
                          }`}
                        >
                          <span>🟢</span>
                          <span className="text-[10px] mt-0.5">Boarded</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMorningStatusChange(record, 'Absent')}
                          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                            record.morningBusStatus === 'Absent'
                              ? 'bg-red-600 text-white shadow-xs font-bold'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>⚪</span>
                          <span className="text-[10px] mt-0.5">Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMorningStatusChange(record, 'Parent Transit')}
                          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                            record.morningBusStatus === 'Parent Transit'
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>🚙</span>
                          <span className="text-[10px] mt-0.5">Parent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMorningStatusChange(record, 'Pending')}
                          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center ${
                            record.morningBusStatus === 'Pending'
                              ? 'bg-slate-300 text-slate-900 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span>⏳</span>
                          <span className="text-[10px] mt-0.5">Wait</span>
                        </button>
                      </div>
                    </div>

                    {/* School Presence & Evening Bus Status Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-blue-900 flex items-center gap-1">
                          <School className="w-3 h-3 text-blue-600" />
                          <span>School Roll Call</span>
                        </span>
                        <select
                          value={record.schoolStatus}
                          onChange={e => handleSchoolStatusChange(record, e.target.value as SchoolPresenceStatus)}
                          className={`w-full text-xs font-semibold p-1.5 rounded-lg border ${
                            record.schoolStatus === 'Present'
                              ? 'bg-blue-50 border-blue-300 text-blue-900'
                              : record.schoolStatus === 'Absent'
                              ? 'bg-red-50 border-red-300 text-red-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <option value="Present">✅ Present</option>
                          <option value="Absent">❌ Absent</option>
                          <option value="Tardy">⏰ Tardy</option>
                          <option value="Excused">📋 Excused</option>
                          <option value="Pending">⏳ Pending</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-emerald-900 flex items-center gap-1">
                          <Home className="w-3 h-3 text-emerald-600" />
                          <span>PM Dismissal</span>
                        </span>
                        <select
                          value={record.eveningBusStatus}
                          onChange={e => handleEveningStatusChange(record, e.target.value as EveningBusStatus)}
                          className={`w-full text-xs font-semibold p-1.5 rounded-lg border ${
                            record.eveningBusStatus === 'Boarded Bus'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <option value="Boarded Bus">🚌 PM Bus</option>
                          <option value="Parent Pickup">🚗 Car Pickup</option>
                          <option value="After-School Activity">🎨 Club</option>
                          <option value="Walker">🚶 Walker</option>
                          <option value="Absent">❌ Absent</option>
                          <option value="Pending">⏳ Pending</option>
                        </select>
                      </div>
                    </div>

                    {/* Unified Formula Safety Badge */}
                    <div className="pt-1">
                      {isCritical ? (
                        <div className="p-2.5 bg-red-100 border border-red-300 rounded-xl text-red-950 flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-xs block">CRITICAL SAFETY DISCREPANCY</span>
                            <span className="text-[10px] text-red-800">
                              Boarded bus at {record.morningPickupTime}, marked Absent at school!
                            </span>
                          </div>
                        </div>
                      ) : isMismatch ? (
                        <div className="p-2 bg-amber-100 border border-amber-300 rounded-xl text-amber-950 flex items-center gap-1.5 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{record.unifiedStatus}</span>
                        </div>
                      ) : isSafeDrop ? (
                        <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-950 flex items-center gap-1.5 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Safe Home Drop-Off Confirmed</span>
                        </div>
                      ) : (
                        <div className="p-2 bg-slate-100 rounded-xl text-slate-700 text-xs font-medium flex items-center justify-between">
                          <span>{record.unifiedStatus}</span>
                        </div>
                      )}
                    </div>

                    {/* Guardian Emergency Phone (Direct Mobile Tap-To-Call) */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <a
                        href={`tel:${record.guardianPhone.replace(/\D/g, '')}`}
                        className="flex-1 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call {record.guardianName || 'Guardian'}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onSelectStudent(record)}
                        className="min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                        title="Student Full Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Main Single-Record Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Daily Single-Record Attendance Log
              </h2>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full font-medium">
                Showing {filteredRecords.length} of {records.length} records
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Click any status cell to update live</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4 min-w-[200px]">Student & Bus Stop</th>
                  <th className="py-3 px-3 min-w-[130px]">Route</th>
                  <th className="py-3 px-4 min-w-[170px] bg-amber-50/50">
                    <div className="flex items-center gap-1.5 text-amber-900">
                      <Bus className="w-3.5 h-3.5 text-amber-600" />
                      <span>Morning Bus Pickup</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[170px] bg-blue-50/50">
                    <div className="flex items-center gap-1.5 text-blue-900">
                      <School className="w-3.5 h-3.5 text-blue-600" />
                      <span>School Presence</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[170px] bg-emerald-50/50">
                    <div className="flex items-center gap-1.5 text-emerald-900">
                      <Home className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Evening Dismissal</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[230px]">
                    <div className="flex items-center gap-1 text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unified Safety Status (Formula)</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 min-w-[130px]">Guardian Contact</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <Bus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium text-sm">No students match your filter criteria</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing search or route filter</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(record => {
                    const isCritical = record.unifiedStatus === 'CRITICAL: Boarded Bus but Missing at School';
                    const isMismatch = record.unifiedStatus.includes('Discrepancy') || record.unifiedStatus.includes('Attention');
                    const isSafeDrop = record.unifiedStatus === 'Safe Home Drop-Off';

                    return (
                      <tr 
                        key={record.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCritical ? 'bg-red-50/70' : isMismatch ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Student Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2.5">
                            <div>
                              <button
                                onClick={() => onSelectStudent(record)}
                                className="font-semibold text-slate-900 hover:text-amber-600 text-left transition-colors flex items-center gap-1.5"
                              >
                                <span>{record.name}</span>
                                {isCritical && (
                                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                                )}
                              </button>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded border border-slate-200">
                                  {record.studentId}
                                </span>
                                <span>· {record.grade}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 truncate max-w-[200px]" title={record.busStop}>
                                <span className="text-slate-400">Stop:</span>
                                <span className="truncate">{record.busStop}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Route Info */}
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded font-medium text-xs bg-slate-100 text-slate-800 border border-slate-200">
                            {record.routeNumber}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[110px]" title={record.routeName}>
                            {record.routeName}
                          </div>
                        </td>

                        {/* Morning Bus Pickup */}
                        <td className="py-3 px-4 bg-amber-50/20">
                          <div className="space-y-1.5">
                            <select
                              value={record.morningBusStatus}
                              onChange={e => handleMorningStatusChange(record, e.target.value as MorningBusStatus)}
                              className={`w-full text-xs font-medium px-2 py-1 rounded-md border transition-colors ${
                                record.morningBusStatus === 'Boarded'
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                                  : record.morningBusStatus === 'Absent'
                                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                                  : record.morningBusStatus === 'Parent Transit'
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <option value="Boarded">🟢 Boarded</option>
                              <option value="Absent">⚪ Absent / Skipped</option>
                              <option value="Parent Transit">🚙 Parent Transit</option>
                              <option value="Walk">🚶 Walk</option>
                              <option value="Pending">⏳ Pending</option>
                            </select>

                            {record.morningPickupTime ? (
                              <div className="flex items-center gap-1 text-[10px] text-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{record.morningPickupTime}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No time logged</span>
                            )}

                            {record.morningAideNotes && (
                              <div className="text-[10px] text-slate-500 italic truncate max-w-[160px]" title={record.morningAideNotes}>
                                "{record.morningAideNotes}"
                              </div>
                            )}
                          </div>
                        </td>

                        {/* School Presence */}
                        <td className="py-3 px-4 bg-blue-50/20">
                          <div className="space-y-1.5">
                            <select
                              value={record.schoolStatus}
                              onChange={e => handleSchoolStatusChange(record, e.target.value as SchoolPresenceStatus)}
                              className={`w-full text-xs font-medium px-2 py-1 rounded-md border transition-colors ${
                                record.schoolStatus === 'Present'
                                  ? 'bg-blue-100 border-blue-300 text-blue-900 font-semibold'
                                  : record.schoolStatus === 'Absent'
                                  ? 'bg-red-100 border-red-300 text-red-900 font-semibold'
                                  : record.schoolStatus === 'Tardy'
                                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                                  : record.schoolStatus === 'Excused'
                                  ? 'bg-purple-100 border-purple-300 text-purple-900'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <option value="Present">✅ Present</option>
                              <option value="Absent">❌ Absent</option>
                              <option value="Tardy">⏰ Tardy</option>
                              <option value="Excused">📋 Excused</option>
                              <option value="Pending">⏳ Pending</option>
                            </select>

                            {record.schoolCheckTime ? (
                              <div className="flex items-center gap-1 text-[10px] text-blue-800">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{record.schoolCheckTime}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No bell time</span>
                            )}

                            <div className="text-[10px] text-slate-500 truncate max-w-[160px]" title={record.homeroom}>
                              {record.homeroom}
                            </div>
                          </div>
                        </td>

                        {/* Evening Bus Dismissal */}
                        <td className="py-3 px-4 bg-emerald-50/20">
                          <div className="space-y-1.5">
                            <select
                              value={record.eveningBusStatus}
                              onChange={e => handleEveningStatusChange(record, e.target.value as EveningBusStatus)}
                              className={`w-full text-xs font-medium px-2 py-1 rounded-md border transition-colors ${
                                record.eveningBusStatus === 'Boarded Bus'
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-semibold'
                                  : record.eveningBusStatus === 'Parent Pickup'
                                  ? 'bg-cyan-100 border-cyan-300 text-cyan-900'
                                  : record.eveningBusStatus === 'After-School Activity'
                                  ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                                  : record.eveningBusStatus === 'Absent'
                                  ? 'bg-red-100 border-red-300 text-red-900'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <option value="Boarded Bus">🚌 Boarded Bus</option>
                              <option value="Parent Pickup">🚗 Parent Pickup</option>
                              <option value="After-School Activity">🎨 Club/Activity</option>
                              <option value="Walker">🚶 Walker</option>
                              <option value="Absent">❌ Absent</option>
                              <option value="Pending">⏳ Pending</option>
                            </select>

                            {record.eveningDropTime ? (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Safe Drop: {record.eveningDropTime}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Awaiting drop</span>
                            )}

                            {record.eveningNotes && (
                              <div className="text-[10px] text-slate-500 italic truncate max-w-[160px]" title={record.eveningNotes}>
                                "{record.eveningNotes}"
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Unified Safety Status (The core Formula output) */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {isCritical ? (
                              <div className="p-2 bg-red-100 border border-red-300 rounded-lg text-red-900">
                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                                  <span>CRITICAL: Boarded Bus but Missing at School</span>
                                </div>
                                <p className="text-[10px] text-red-800 mt-0.5">
                                  Boarded at {record.morningPickupTime}, marked Absent in classroom.
                                </p>
                              </div>
                            ) : isMismatch ? (
                              <div className="p-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-950">
                                <div className="flex items-center gap-1.5 font-semibold text-xs">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>{record.unifiedStatus}</span>
                                </div>
                              </div>
                            ) : isSafeDrop ? (
                              <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-950">
                                <div className="flex items-center gap-1.5 font-semibold text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Safe Home Drop-Off Confirmed</span>
                                </div>
                                <p className="text-[10px] text-emerald-800 mt-0.5">
                                  Completed full daily cycle safely.
                                </p>
                              </div>
                            ) : record.unifiedStatus === 'Safe In Transit / Present' ? (
                              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900">
                                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span>Safe In Transit / In School</span>
                                </div>
                              </div>
                            ) : record.unifiedStatus === 'Full Absence Excused' ? (
                              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600">
                                <span className="text-xs font-medium">Full Absence (Excused)</span>
                              </div>
                            ) : (
                              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                                <span className="text-xs">Pending Morning Confirmation</span>
                              </div>
                            )}

                            {record.specialNotes && (
                              <div className="text-[10px] text-red-700 font-medium">
                                Note: {record.specialNotes}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Guardian Emergency Phone */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-slate-800">
                              {record.guardianName}
                            </div>
                            <a
                              href={`tel:${record.guardianPhone.replace(/\D/g, '')}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{record.guardianPhone}</span>
                            </a>
                          </div>
                        </td>

                        {/* Row Action */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => onSelectStudent(record)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Student Dossier & Edit"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Help / Phone App Modal */}
      {showMobileHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Smartphone className="w-5 h-5 text-amber-600" />
                <span>Running on Mobile Phones (iOS & Android)</span>
              </div>
              <button
                onClick={() => setShowMobileHelp(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 text-xs mb-1">
                  1. Run Directly as a Standalone Phone App:
                </h4>
                <p>
                  Open this application URL in <strong>Safari (iPhone)</strong> or <strong>Chrome (Android)</strong>. Tap <strong>Share</strong> &gt; <strong>"Add to Home Screen"</strong>. It launches full-screen with no browser address bar, exactly like a native app installed from the App Store!
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 text-xs mb-1">
                  2. Driver Cards (One-Tap Thumb Mode):
                </h4>
                <p>
                  Bus drivers don't need to type clock times. Tap the <strong>"Driver Cards"</strong> view mode: each student card has large 44px+ tap targets (🟢 Boarded, ⚪ Absent, 🚙 Parent) that automatically log the exact current second into the record!
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 text-xs mb-1">
                  3. In the Official Google Sheets Mobile App:
                </h4>
                <p>
                  The template, dropdown chips, and formulas generated by this tool open seamlessly inside the free <strong>Google Sheets app</strong> on iPhones, iPads, and Android phones. The Google Apps Script automations run automatically in the cloud.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowMobileHelp(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

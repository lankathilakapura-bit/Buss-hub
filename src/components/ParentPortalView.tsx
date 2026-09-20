import React, { useState } from 'react';
import { SriLankaStudent, SriLankaVan, generateParentToDriverWhatsAppLink } from '../data/sriLankaData';
import {
  HeartHandshake,
  Bus,
  School,
  Home,
  Clock,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Send,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  User,
  Calendar,
  XCircle,
  BarChart2,
  Radio
} from 'lucide-react';
import { BusLiveMap } from './BusLiveMap';
import {
  HistoryStore,
  MonthlyPaymentStore,
  getWeekDays,
  getMonthDays,
  calculateStudentWeeklySummary,
  calculateStudentMonthlySummary,
  loadMonthlyPayments,
  formatDateISO
} from '../data/historyManager';

interface ParentPortalViewProps {
  students: SriLankaStudent[];
  vans: SriLankaVan[];
  lang: 'si' | 'en' | 'ta';
  selectedStudentId?: string;
  onSelectStudentId?: (id: string) => void;
  compact?: boolean;
  history?: HistoryStore;
  currentDateStr?: string;
  paymentStore?: MonthlyPaymentStore;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  students,
  vans,
  lang,
  selectedStudentId,
  onSelectStudentId,
  compact = false,
  history = {},
  currentDateStr = formatDateISO(new Date()),
  paymentStore
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    selectedStudentId || (students[0]?.id || '')
  );
  const [parentTimeframe, setParentTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [isLiveMapOpen, setIsLiveMapOpen] = useState<boolean>(false);

  const activeId = selectedStudentId !== undefined ? selectedStudentId : internalSelectedId;
  const activeStudent = students.find(s => s.id === activeId) || students[0];

  const handleChooseStudent = (id: string) => {
    setInternalSelectedId(id);
    if (onSelectStudentId) {
      onSelectStudentId(id);
    }
  };

  if (!activeStudent) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 font-semibold">
          {lang === 'si' ? 'කිසිදු ළමයෙකු ලියාපදිංචි කර නැත.' : 'No students found.'}
        </p>
      </div>
    );
  }

  // Find assigned van details
  const assignedVan = vans.find(v => v.vanNumber === activeStudent.vanNumber) || {
    vanNumber: activeStudent.vanNumber,
    driverName: 'School Van Uncle',
    driverPhone: '0771234567',
    routeTitle: activeStudent.vanRoute,
    routeTowns: ''
  };

  // Determine overall status
  const isCriticalMissing = activeStudent.morningStatus === 'InVan' && activeStudent.schoolStatus === 'Absent';
  const isSafeInSchool = activeStudent.schoolStatus === 'Present' && activeStudent.eveningStatus === 'Pending';
  const isDroppedHome = activeStudent.eveningStatus === 'DroppedHome';
  const isCurrentlyInVan = 
    (activeStudent.morningStatus === 'InVan' && activeStudent.schoolStatus === 'Pending') ||
    activeStudent.eveningStatus === 'InVan';

  return (
    <div className={`space-y-4 ${compact ? 'text-xs' : ''}`}>
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white">
                  {lang === 'si' ? '2 වන පිටුව: දෙමාපිය සජීවී තොරතුරු පිටුව' : '2nd Page: Parents Live Tracking Portal'}
                </h2>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-400/40">
                  {lang === 'si' ? 'දෙමාපියන් සඳහා' : 'For Parents'}
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {lang === 'si' ? 'සජීවීව' : 'LIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'si' 
                  ? 'ඔබේ දරුවාගේ පාසල් වෑන් රථ සහ පන්තිකාමර පැමිණීම තත්‍ය කාලීනව මෙතැනින් බලන්න' 
                  : 'Real-time school bus pickup, school presence & safe drop-off status'}
              </p>
            </div>
          </div>

          {/* Child Switcher Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">
              {lang === 'si' ? 'දරුවා:' : 'Student:'}
            </span>
            <select
              value={activeStudent.id}
              onChange={e => handleChooseStudent(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.nameSi ? `(${s.nameSi})` : ''} - {s.grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Child Identity Banner */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
              {activeStudent.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>{activeStudent.name}</span>
                {activeStudent.nameSi && (
                  <span className="text-xs text-amber-300 font-normal">({activeStudent.nameSi})</span>
                )}
              </h3>
              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-300">
                  {activeStudent.grade}
                </span>
                <span>·</span>
                <span className="text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{activeStudent.pickupLocation}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Emergency / Safe Status Pill */}
          <div>
            {isCriticalMissing ? (
              <div className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 animate-bounce shadow-md">
                <ShieldAlert className="w-4 h-4" />
                <span>{lang === 'si' ? 'අවධානය: පාසලේදී නොපැමිණි බව සටහන්ව ඇත!' : 'ALERT: Missing in class!'}</span>
              </div>
            ) : isDroppedHome ? (
              <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'si' ? 'ආරක්ෂිතව නිවසට භාරදී ඇත' : 'Safely Dropped at Home'}</span>
              </div>
            ) : isSafeInSchool ? (
              <div className="px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <School className="w-4 h-4 text-blue-400" />
                <span>{lang === 'si' ? 'ආරක්ෂිතව පාසල තුළ සිටී' : 'Safely in School'}</span>
              </div>
            ) : isCurrentlyInVan ? (
              <div className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{lang === 'si' ? 'වෑන් රථයේ ගමන් කරමින් සිටී' : 'Currently in Transit'}</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{lang === 'si' ? 'දෛනික සටහන් බලාපොරොත්තුවෙන්' : 'Awaiting transit'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PARENT TIMEFRAME SELECTOR (Today, Week Data, Month Data) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setParentTimeframe('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              parentTimeframe === 'today'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'si' ? 'අද සජීවී ගමන (Today)' : "Today's Live"}</span>
          </button>

          <button
            type="button"
            onClick={() => setParentTimeframe('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              parentTimeframe === 'week'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
            <span>{lang === 'si' ? 'මේ සතියේ සටහන් (Week Data)' : 'Week Data'}</span>
          </button>

          <button
            type="button"
            onClick={() => setParentTimeframe('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              parentTimeframe === 'month'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'si' ? 'මාසික වාර්තාව (Month Data)' : 'Month Data'}</span>
          </button>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 px-2">
          {activeStudent.name} · {activeStudent.grade}
        </div>
      </div>

      {/* VIEW 1: TODAY'S JOURNEY */}
      {parentTimeframe === 'today' && (
        <>
          {/* THREE-STEP JOURNEY CARD (Visual Progress for Parents) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'si' ? 'අද දවසේ දරුවාගේ ගමන් තොරතුරු' : "Today's Transit Timeline"}</span>
              </h4>

              <button
                type="button"
                onClick={() => setIsLiveMapOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 border border-amber-400"
              >
                <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                <span>{lang === 'si' ? '🗺️ සජීවී බස් සිතියම (PickMe Map)' : '🗺️ Track Bus Live (PickMe Map)'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-ping"></span>
              </button>
            </div>

            {/* 3 Step Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1: Morning Bus */}
              <div className={`rounded-xl p-3.5 border-2 transition-all ${
                activeStudent.morningStatus === 'InVan'
                  ? 'bg-amber-50/60 border-amber-400'
                  : activeStudent.morningStatus === 'Absent'
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-slate-50/50 border-dashed border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'si' ? '1. උදෑසන වෑන් රථය' : '1. Morning Pickup'}
                  </span>
                  <Bus className={`w-4 h-4 ${
                    activeStudent.morningStatus === 'InVan' ? 'text-amber-600' : 'text-slate-400'
                  }`} />
                </div>

                <div className="mt-2">
                  <div className="font-black text-sm sm:text-base text-slate-900">
                    {activeStudent.morningStatus === 'InVan' ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 inline shrink-0" />
                        <span>{lang === 'si' ? 'වෑන් රථයට නැග්ගා' : 'Safely Boarded'}</span>
                      </span>
                    ) : activeStudent.morningStatus === 'Absent' ? (
                      <span className="text-slate-600">{lang === 'si' ? 'නොපැමිණියේය (නෑ)' : 'Marked Absent'}</span>
                    ) : activeStudent.morningStatus === 'WithParent' ? (
                      <span className="text-blue-700">{lang === 'si' ? 'දෙමාපියන් ගෙන ගියා' : 'With Parent'}</span>
                    ) : (
                      <span className="text-slate-400 font-medium">{lang === 'si' ? 'තවම සටහන්වී නැත' : 'Pending'}</span>
                    )}
                  </div>

                  {activeStudent.morningTime && (
                    <div className="text-xs text-slate-600 font-mono mt-1 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{lang === 'si' ? `නැග්ග වෙලාව: ${activeStudent.morningTime}` : `Time: ${activeStudent.morningTime}`}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Classroom Presence */}
              <div className={`rounded-xl p-3.5 border-2 transition-all ${
                isCriticalMissing
                  ? 'bg-red-50 border-red-500 animate-pulse'
                  : activeStudent.schoolStatus === 'Present'
                  ? 'bg-blue-50/60 border-blue-400'
                  : 'bg-slate-50/50 border-dashed border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'si' ? '2. පාසලේ පැමිණීම' : '2. School Classroom'}
                  </span>
                  <School className={`w-4 h-4 ${
                    activeStudent.schoolStatus === 'Present' ? 'text-blue-600' : isCriticalMissing ? 'text-red-600' : 'text-slate-400'
                  }`} />
                </div>

                <div className="mt-2">
                  <div className="font-black text-sm sm:text-base text-slate-900">
                    {isCriticalMissing ? (
                      <span className="text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 inline shrink-0" />
                        <span>{lang === 'si' ? 'නොපැමිණි බව සටහන්ව ඇත!' : 'Absent in Classroom!'}</span>
                      </span>
                    ) : activeStudent.schoolStatus === 'Present' ? (
                      <span className="text-blue-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 inline shrink-0" />
                        <span>{lang === 'si' ? 'පන්තියට පැමිණ ඇත' : 'Present in School'}</span>
                      </span>
                    ) : activeStudent.schoolStatus === 'Absent' ? (
                      <span className="text-slate-600">{lang === 'si' ? 'නොපැමිණියා' : 'Absent'}</span>
                    ) : (
                      <span className="text-slate-400 font-medium">{lang === 'si' ? 'පාසල් ලේඛනය බලාපොරොත්තුවෙන්' : 'Awaiting Check-in'}</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {activeStudent.grade}
                  </div>
                </div>
              </div>

              {/* Step 3: Evening Drop-off */}
              <div className={`rounded-xl p-3.5 border-2 transition-all ${
                activeStudent.eveningStatus === 'DroppedHome'
                  ? 'bg-emerald-50/60 border-emerald-400'
                  : activeStudent.eveningStatus === 'InVan'
                  ? 'bg-amber-50/60 border-amber-400'
                  : 'bg-slate-50/50 border-dashed border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'si' ? '3. සවස නිවසට භාරදීම' : '3. Afternoon Drop-off'}
                  </span>
                  <Home className={`w-4 h-4 ${
                    activeStudent.eveningStatus === 'DroppedHome' ? 'text-emerald-600' : 'text-slate-400'
                  }`} />
                </div>

                <div className="mt-2">
                  <div className="font-black text-sm sm:text-base text-slate-900">
                    {activeStudent.eveningStatus === 'DroppedHome' ? (
                      <span className="text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 inline shrink-0" />
                        <span>{lang === 'si' ? 'ගෙදරට ආරක්ෂිතව බැස්සුවා' : 'Safely Dropped at Home'}</span>
                      </span>
                    ) : activeStudent.eveningStatus === 'InVan' ? (
                      <span className="text-amber-800 flex items-center gap-1">
                        <Bus className="w-4 h-4 inline shrink-0" />
                        <span>{lang === 'si' ? 'සවස වෑන් රථයේ එමින් සිටී' : 'In Afternoon Transit'}</span>
                      </span>
                    ) : activeStudent.eveningStatus === 'ParentPickup' ? (
                      <span className="text-indigo-800">{lang === 'si' ? 'දෙමාපියන් රැගෙන ගියා' : 'Parent Picked Up'}</span>
                    ) : (
                      <span className="text-slate-400 font-medium">{lang === 'si' ? 'සවස ගමන ආරම්භ වී නැත' : 'Pending Afternoon'}</span>
                    )}
                  </div>

                  {activeStudent.eveningTime && (
                    <div className="text-xs text-slate-600 font-mono mt-1 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{lang === 'si' ? `බැස්ස වෙලාව: ${activeStudent.eveningTime}` : `Time: ${activeStudent.eveningTime}`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: WEEK DATA FOR THIS STUDENT */}
      {parentTimeframe === 'week' && (() => {
        const weekDays = getWeekDays(currentDateStr);
        const weeklySummary = calculateStudentWeeklySummary(activeStudent.id, weekDays, history);

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'si' ? 'මේ සතියේ දින 5 ගමන් ඉතිහාසය' : '5-Day Weekly Transit Log'}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'si'
                    ? `${activeStudent.name} ගේ සඳුදා සිට සිකුරාදා දක්වා දෛනික සටහන්`
                    : `Monday to Friday daily transit log for ${activeStudent.name}`}
                </p>
              </div>

              {/* Weekly summary badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                  {weeklySummary.attendanceRate}% {lang === 'si' ? 'පැමිණීම' : 'Attendance'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {weeklySummary.schoolPresentDays}/5 {lang === 'si' ? 'දින' : 'days present'}
                </span>
              </div>
            </div>

            {/* 5 Day Cards */}
            <div className="space-y-2.5">
              {weekDays.map(day => {
                const rec = history[day.dateStr]?.[activeStudent.id];
                const isAbsent = rec?.morningStatus === 'Absent';
                const isInVan = rec?.morningStatus === 'InVan';
                const isDropped = rec?.eveningStatus === 'DroppedHome';

                return (
                  <div
                    key={day.dateStr}
                    className={`p-3.5 rounded-xl border transition-all ${
                      day.isToday
                        ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                          day.isToday ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {day.dayNumber}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{lang === 'si' ? day.dayNameSi : day.dayName}</span>
                            {day.isToday && (
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-sm">
                                {lang === 'si' ? 'අද' : 'Today'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {day.dateStr}
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Morning */}
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          isInVan
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : isAbsent
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : rec?.morningStatus === 'WithParent'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isInVan ? <Bus className="w-3 h-3 text-amber-700" /> : isAbsent ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>
                            {isInVan
                              ? (rec?.morningTime ? `නැග්ගා: ${rec.morningTime}` : 'නැග්ගා (In Van)')
                              : isAbsent
                              ? (lang === 'si' ? 'නිවාඩු' : 'Absent')
                              : (lang === 'si' ? 'තවම නෑ' : 'Pending')}
                          </span>
                        </div>

                        {/* School */}
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          rec?.schoolStatus === 'Present'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : rec?.schoolStatus === 'Absent'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          <School className="w-3 h-3" />
                          <span>
                            {rec?.schoolStatus === 'Present'
                              ? (lang === 'si' ? 'පාසලේ සිටී' : 'In School')
                              : rec?.schoolStatus === 'Absent'
                              ? (lang === 'si' ? 'නොපැමිණියා' : 'Absent')
                              : (lang === 'si' ? 'බලාපොරොත්තුවෙන්' : 'Pending')}
                          </span>
                        </div>

                        {/* Evening */}
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          isDropped
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <Home className="w-3 h-3 text-emerald-600" />
                          <span>
                            {isDropped
                              ? (rec?.eveningTime ? `ගෙදරට: ${rec.eveningTime}` : 'ගෙදරට භාරදුන්නා')
                              : (lang === 'si' ? 'සවස සටහන්' : 'PM pending')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* VIEW 3: MONTH DATA FOR THIS STUDENT */}
      {parentTimeframe === 'month' && (() => {
        const [curY, curM] = currentDateStr.split('-').map(Number);
        const monthlySummary = calculateStudentMonthlySummary(
          activeStudent.id,
          curY || 2026,
          curM || 9,
          history,
          activeStudent.monthlyRate,
          paymentStore
        );

        const isPaid = monthlySummary.paymentStatus === 'Paid';

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'si' ? 'මාසික පැමිණීම හා වෑන් ගාස්තු සාරාංශය' : 'Monthly Attendance & Van Ledger'}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeStudent.name} · {monthlySummary.monthName} {curY || 2026} {lang === 'si' ? 'මාසය සඳහා වාර්තාව' : 'summary report'}
                </p>
              </div>

              <div className="text-xs font-black bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-xl">
                {monthlySummary.monthName}
              </div>
            </div>

            {/* Monthly KPI Grid for Parent */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">{lang === 'si' ? 'පාසල් පැමිණි දින' : 'Days in School'}</div>
                <div className="text-xl font-black text-blue-700 mt-1">
                  {monthlySummary.schoolPresentDays} <span className="text-xs font-normal text-slate-400">/ {monthlySummary.totalSchoolDays}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">{lang === 'si' ? 'වෑන් රථයෙන් ගමන්' : 'Van Travel Days'}</div>
                <div className="text-xl font-black text-amber-600 mt-1">
                  {monthlySummary.vanDays} <span className="text-xs font-normal text-slate-400">දින</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">{lang === 'si' ? 'මුළු නිවාඩු දින' : 'Absence Days'}</div>
                <div className="text-xl font-black text-rose-600 mt-1">
                  {monthlySummary.absentDays}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">{lang === 'si' ? 'පැමිණීමේ අනුපාතය' : 'Attendance Rate'}</div>
                <div className="text-xl font-black text-emerald-600 mt-1">
                  {monthlySummary.attendanceRate}%
                </div>
              </div>
            </div>

            {/* MONTHLY VAN FEE & PAYMENT STATUS CARD (PAID OR NOT) */}
            <div className={`p-4 rounded-2xl border-2 transition-all ${
              isPaid
                ? 'bg-emerald-50/80 border-emerald-300'
                : 'bg-amber-50/90 border-amber-300'
            }`}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                    isPaid ? 'bg-emerald-600 text-white shadow-xs' : 'bg-amber-500 text-slate-950 shadow-xs'
                  }`}>
                    {isPaid ? '✓' : 'Rs.'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-black text-sm sm:text-base text-slate-900">
                        {lang === 'si' ? 'මාසික ඇස්තමේන්තු වෑන් ගාස්තුව (Monthly Est. Rate)' : 'Monthly Van Fee'}
                      </h5>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                        isPaid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{lang === 'si' ? 'ගෙවා ඇත (PAID)' : 'PAID'}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{lang === 'si' ? 'ගෙවීමට ඉතිරිව ඇත (NOT PAID)' : 'NOT PAID / DUE'}</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-0.5">
                      {assignedVan.vanNumber} · {assignedVan.driverName} ({activeStudent.pickupLocation})
                    </div>

                    {isPaid ? (
                      <div className="mt-2 text-xs font-semibold text-emerald-800 flex items-center gap-2 flex-wrap bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                        <span>{lang === 'si' ? `ගෙවූ මුදල: Rs. ${(monthlySummary.paidAmount || monthlySummary.monthlyFeeEstimated).toLocaleString()}` : `Paid: Rs. ${(monthlySummary.paidAmount || monthlySummary.monthlyFeeEstimated).toLocaleString()}`}</span>
                        {monthlySummary.paidDate && <span>· {lang === 'si' ? `දිනය: ${monthlySummary.paidDate}` : `Date: ${monthlySummary.paidDate}`}</span>}
                        {monthlySummary.paymentMethod && <span>· {lang === 'si' ? `ක්‍රමය: ${monthlySummary.paymentMethod}` : `Method: ${monthlySummary.paymentMethod}`}</span>}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-amber-900 font-medium">
                        {lang === 'si'
                          ? 'කරුණාකර මෙම මාසික ගාස්තුව රියදුරු අංකල් වෙත මුදලින් හෝ බැංකු තැන්පතුවක් මගින් පියවීමට කාරුණික වන්න.'
                          : 'Payment is pending. Please hand over cash or complete bank transfer to the driver.'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    Rs. {monthlySummary.monthlyFeeEstimated.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    {lang === 'si' ? 'දරුවාගේ නියමිත ගාස්තුව' : 'Child individual rate'}
                  </div>
                </div>
              </div>

              {/* Action buttons for parents */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-slate-500">
                  {isPaid ? '✓ Payment record confirmed by school van management' : '💡 You can coordinate fee payment directly with the driver on WhatsApp'}
                </span>

                <a
                  href={`https://wa.me/94${assignedVan.driverPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                    lang === 'si'
                      ? `ආයුබෝවන් ${assignedVan.driverName} අංකල්, මම ${activeStudent.name} ගේ දෙමාපියන්. ${monthlySummary.monthName} මාසික වෑන් ගාස්තුව (Rs. ${monthlySummary.monthlyFeeEstimated.toLocaleString()}) ගෙවීම සම්බන්ධවයි විමසන්නේ.`
                      : `Hello ${assignedVan.driverName}, I am parent of ${activeStudent.name}. Inquiring regarding ${monthlySummary.monthName} school van fee (Rs. ${monthlySummary.monthlyFeeEstimated.toLocaleString()}).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{lang === 'si' ? 'ගාස්තු විමසීමට WhatsApp' : 'Message Driver regarding Fees'}</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ASSIGNED BUS & DRIVER CONTACT CARD */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{assignedVan.vanNumber}</h4>
              <p className="text-xs text-slate-400">
                {lang === 'si' ? `රියදුරු: ${assignedVan.driverName}` : `Driver: ${assignedVan.driverName}`}
              </p>
            </div>
          </div>

          {/* 1-Tap Direct Call and WhatsApp to Driver */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${assignedVan.driverPhone}`}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs"
              title="රියදුරු අංකල්ට කෙලින්ම කෝල් කරන්න"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'si' ? 'කෝල් කරන්න' : 'Call'}</span>
            </a>

            <button
              type="button"
              onClick={() => setIsLiveMapOpen(true)}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              title="සජීවී බස් සිතියම බලන්න"
            >
              <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
              <span>{lang === 'si' ? 'සිතියම (Map)' : 'Live Map'}</span>
            </button>

            <a
              href={generateParentToDriverWhatsAppLink(
                assignedVan.driverPhone,
                assignedVan.driverName,
                activeStudent.name,
                'where_is_bus',
                lang
              )}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              title="WhatsApp මගින් පණිවිඩයක් යවන්න"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong className="text-slate-200">{lang === 'si' ? 'මාර්ගය:' : 'Route:'}</strong> {assignedVan.routeTitle}
          </span>
        </div>
      </div>

      {/* QUICK ACTIONS: 1-TAP PARENT NOTICES TO DRIVER */}
      <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
            <Send className="w-4 h-4 text-amber-700" />
            <span>
              {lang === 'si' ? 'වෑන් රථ රියදුරුට 1-Tap පණිවිඩ යැවීම' : '1-Tap Quick Notices to Bus Driver'}
            </span>
          </h4>
          <span className="text-[11px] text-amber-800 font-medium">
            {lang === 'si' ? 'WhatsApp මගින් ක්ෂණිකව යැවේ' : 'Pre-written WhatsApp'}
          </span>
        </div>

        <p className="text-xs text-amber-900/80 leading-relaxed">
          {lang === 'si'
            ? 'අකුරු ටයිප් කරන්න අවශ්‍ය නෑ! පහත බොත්තම ඔබා රියදුරු අංකල්ට කෙලින්ම දැනුම් දෙන්න:'
            : 'No typing required! Tap any quick notice below to notify your child’s driver instantly:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* 1. Absent Notice */}
          <a
            href={generateParentToDriverWhatsAppLink(
              assignedVan.driverPhone,
              assignedVan.driverName,
              activeStudent.name,
              'absent_today',
              lang
            )}
            target="_blank"
            rel="noreferrer"
            className="p-3 bg-white hover:bg-red-50 border border-amber-300 hover:border-red-300 rounded-xl text-left transition-colors group shadow-2xs"
          >
            <div className="text-xs font-black text-slate-900 group-hover:text-red-700 flex items-center justify-between">
              <span>{lang === 'si' ? '🛑 අද නිවාඩු / එන්නේ නෑ' : 'Child Absent Today'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'si' ? 'අද වෑන් එකට එන්නේ නැති බව දැනුම් දෙන්න' : 'Notify driver not to wait at stop'}
            </p>
          </a>

          {/* 2. Parent Pickup Afternoon */}
          <a
            href={generateParentToDriverWhatsAppLink(
              assignedVan.driverPhone,
              assignedVan.driverName,
              activeStudent.name,
              'parent_pickup_pm',
              lang
            )}
            target="_blank"
            rel="noreferrer"
            className="p-3 bg-white hover:bg-blue-50 border border-amber-300 hover:border-blue-300 rounded-xl text-left transition-colors group shadow-2xs"
          >
            <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
              <span>{lang === 'si' ? '🚗 හවස දෙමාපියන් ගන්නවා' : 'Parent Pickup Today'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'si' ? 'හවස වෑන් එකෙන් එන්නේ නැති බව දන්වන්න' : 'We will pick up from school PM'}
            </p>
          </a>

          {/* 3. Ask ETA */}
          <a
            href={generateParentToDriverWhatsAppLink(
              assignedVan.driverPhone,
              assignedVan.driverName,
              activeStudent.name,
              'where_is_bus',
              lang
            )}
            target="_blank"
            rel="noreferrer"
            className="p-3 bg-white hover:bg-amber-100/50 border border-amber-300 hover:border-amber-400 rounded-xl text-left transition-colors group shadow-2xs"
          >
            <div className="text-xs font-black text-slate-900 group-hover:text-amber-900 flex items-center justify-between">
              <span>{lang === 'si' ? '⏱️ වෑන් එක එන්න කොච්චර වෙලා යයිද?' : 'Where is the bus / ETA?'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'si' ? 'නැවතුමට පැමිණෙන වේලාව අසන්න' : 'Ask arrival time for student stop'}
            </p>
          </a>
        </div>
      </div>

      {/* Live Bus Map Modal (PickMe Style) */}
      {isLiveMapOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-3xl">
            <BusLiveMap
              onClose={() => setIsLiveMapOpen(false)}
              students={students}
              initialVanNumber={activeStudent.vanNumber}
              lang={lang}
            />
          </div>
        </div>
      )}
    </div>
  );
};

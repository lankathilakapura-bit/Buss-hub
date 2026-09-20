import React, { useState } from 'react';
import {
  WeekDayInfo,
  HistoryStore,
  getWeekDays,
  formatDateISO,
  calculateStudentWeeklySummary
} from '../data/historyManager';
import { SriLankaStudent, SriLankaVan } from '../data/sriLankaData';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Bus,
  School,
  Home,
  Copy,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  Users
} from 'lucide-react';

interface SriLankaWeekViewProps {
  currentDateStr: string;
  onSelectDate: (dateStr: string) => void;
  students: SriLankaStudent[];
  vans: SriLankaVan[];
  selectedVan: string;
  history: HistoryStore;
  lang: 'si' | 'en' | 'ta';
  onNavigateToDay?: (dateStr: string) => void;
}

export const SriLankaWeekView: React.FC<SriLankaWeekViewProps> = ({
  currentDateStr,
  onSelectDate,
  students,
  vans,
  selectedVan,
  history,
  lang,
  onNavigateToDay
}) => {
  const handleNavigate = onNavigateToDay || onSelectDate;
  const [refDate, setRefDate] = useState<string>(currentDateStr);
  const [copied, setCopied] = useState(false);

  // Get Monday-Friday for the week
  const weekDays: WeekDayInfo[] = getWeekDays(refDate);

  // Previous week / Next week
  const handlePrevWeek = () => {
    const d = new Date(refDate);
    d.setDate(d.getDate() - 7);
    const newStr = formatDateISO(d);
    setRefDate(newStr);
  };

  const handleNextWeek = () => {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 7);
    const newStr = formatDateISO(d);
    setRefDate(newStr);
  };

  const handleJumpToCurrentWeek = () => {
    const todayStr = formatDateISO(new Date());
    setRefDate(todayStr);
  };

  const filteredStudents = selectedVan === 'all'
    ? students
    : students.filter(s => s.vanNumber === selectedVan);

  // Overall weekly metrics
  const weeklySummaries = filteredStudents.map(s =>
    calculateStudentWeeklySummary(s.id, weekDays, history)
  );

  const totalPossibleVanTrips = filteredStudents.length * 5;
  const actualVanTrips = weeklySummaries.reduce((sum, s) => sum + s.vanBoardedDays, 0);
  const avgAttendance = Math.round(
    weeklySummaries.reduce((sum, s) => sum + s.attendanceRate, 0) / (weeklySummaries.length || 1)
  );
  const totalAbsences = weeklySummaries.reduce((sum, s) => sum + s.absentDays, 0);

  const mondayStr = weekDays[0]?.dateStr || '';
  const fridayStr = weekDays[4]?.dateStr || '';

  // Copy weekly summary to clipboard
  const handleCopySummary = () => {
    const lines = [
      `📊 WEEKLY SCHOOL TRANSIT LOG (${mondayStr} to ${fridayStr})`,
      `Van Filter: ${selectedVan === 'all' ? 'All Vans' : selectedVan}`,
      `Total Van Boardings: ${actualVanTrips} / ${totalPossibleVanTrips}`,
      `Avg Attendance: ${avgAttendance}%`,
      `--------------------------------------------------`,
      `Student Name\tGrade\tMon\tTue\tWed\tThu\tFri\tRate`
    ];

    filteredStudents.forEach(s => {
      const summary = calculateStudentWeeklySummary(s.id, weekDays, history);
      const dayStatuses = weekDays.map(d => {
        const rec = history[d.dateStr]?.[s.id];
        if (!rec) return 'Pending';
        if (rec.morningStatus === 'InVan') return 'Van';
        if (rec.morningStatus === 'WithParent') return 'Parent';
        if (rec.morningStatus === 'Absent') return 'Absent';
        return 'Pending';
      }).join('\t');

      lines.push(`${s.name}\t${s.grade}\t${dayStatuses}\t${summary.attendanceRate}%`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                {lang === 'si' ? 'සතියේ පාසල් ගමන් ලේඛනය (Week View)' : 'Weekly Transit Register'}
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {weekDays[0]?.dayNumber} - {weekDays[4]?.dayNumber} {new Date(refDate).toLocaleString('default', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'si'
                ? 'සඳුදා සිට සිකුරාදා දක්වා සෑම දරුවෙකුගේම පැමිණීම සහ වෑන් රථයේ සටහන්'
                : 'Monday to Friday full attendance, van pickup and evening drop log'}
            </p>
          </div>
        </div>

        {/* Controls: Prev / Next Week */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
            title="පෙර සතිය (Previous Week)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'si' ? 'පෙර සතිය' : 'Prev'}</span>
          </button>

          <button
            onClick={handleJumpToCurrentWeek}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            {lang === 'si' ? 'මේ සතිය (Current Week)' : 'This Week'}
          </button>

          <button
            onClick={handleNextWeek}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
            title="මීළඟ සතිය (Next Week)"
          >
            <span className="hidden sm:inline">{lang === 'si' ? 'මීළඟ සතිය' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ml-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
            <span>{copied ? (lang === 'si' ? 'පිටපත් විය!' : 'Copied!') : (lang === 'si' ? 'වාර්තාව පිටපත් කරන්න' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Quick Weekly KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'si' ? 'වෑන් ගමන් වාර' : 'Van Trips'}
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
            <span>{actualVanTrips}</span>
            <span className="text-xs font-bold text-slate-400">/ {totalPossibleVanTrips}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <Bus className="w-3 h-3" />
            <span>{lang === 'si' ? 'වෑන් රථයෙන් ගමන් ගත් වාර' : 'Total boarded'}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'si' ? 'සාමාන්‍ය පැමිණීම' : 'Avg Attendance'}
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {avgAttendance}%
          </div>
          <div className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-1">
            <School className="w-3 h-3" />
            <span>{lang === 'si' ? 'පාසල් පැමිණීමේ ප්‍රතිශතය' : 'School Presence'}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'si' ? 'නිවාඩු / නොපැමිණීම්' : 'Total Absences'}
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            {totalAbsences}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            {lang === 'si' ? 'දින 5 තුළ මුළු නිවාඩු' : 'Across 5 school days'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'si' ? 'ලියාපදිංචි ළමුන්' : 'Active Students'}
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {filteredStudents.length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            {selectedVan === 'all' ? (lang === 'si' ? 'සියලුම වෑන් රථ' : 'All 3 vans') : selectedVan}
          </div>
        </div>
      </div>

      {/* Main Weekly Attendance Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-xs sm:text-sm text-slate-900">
              {lang === 'si' ? 'සතියේ ශිෂ්‍ය නාමාවලිය සහ දින 5 සටහන්' : '5-Day Student Attendance Matrix'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {lang === 'si' ? 'ඕනෑම දිනයක් මත click කර එම දිනයේ සටහන් වෙත යන්න' : 'Click on any day column header to open that day'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3.5 w-52">{lang === 'si' ? 'ශිෂ්‍යයා සහ පන්තිය' : 'Student'}</th>
                {weekDays.map(day => (
                  <th
                    key={day.dateStr}
                    className={`py-2.5 px-2.5 text-center cursor-pointer hover:bg-amber-100/50 transition-colors ${
                      day.isToday ? 'bg-amber-200/60 font-black text-slate-950 border-x border-amber-300/60' : ''
                    }`}
                    onClick={() => handleNavigate(day.dateStr)}
                    title="මෙම දිනය තෝරන්න (Select this date)"
                  >
                    <div className="text-xs font-black">
                      {lang === 'si' ? day.dayNameSi : day.dayNameShort}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      {day.dayNumber} {day.isToday && '★'}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 text-center w-24">{lang === 'si' ? 'පැමිණීම' : 'Rate'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map(student => {
                const summary = calculateStudentWeeklySummary(student.id, weekDays, history);
                return (
                  <tr key={student.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-600">{student.grade}</span>
                        <span>·</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[130px]">{student.vanNumber.split('(')[0]}</span>
                      </div>
                    </td>

                    {/* Mon - Fri Days */}
                    {weekDays.map(day => {
                      const rec = history[day.dateStr]?.[student.id];
                      return (
                        <td
                          key={day.dateStr}
                          className={`py-2 px-2 text-center align-middle ${
                            day.isToday ? 'bg-amber-100/30 border-x border-amber-200/50' : ''
                          }`}
                        >
                          {!rec || rec.morningStatus === 'Pending' ? (
                            <button
                              onClick={() => handleNavigate(day.dateStr)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 text-[10px] font-semibold transition-colors"
                              title="සටහන් කිරීමට ක්ලික් කරන්න"
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>-</span>
                            </button>
                          ) : rec.morningStatus === 'Absent' ? (
                            <button
                              onClick={() => handleNavigate(day.dateStr)}
                              className="inline-flex flex-col items-center justify-center p-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold w-full transition-all hover:ring-1 hover:ring-rose-300"
                              title="නොපැමිණි බව සටහන් විය"
                            >
                              <div className="flex items-center gap-0.5">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>{lang === 'si' ? 'නිවාඩු' : 'Absent'}</span>
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleNavigate(day.dateStr)}
                              className="inline-flex flex-col items-center justify-center p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold w-full transition-all hover:ring-1 hover:ring-emerald-300"
                              title={`උදේ: ${rec.morningStatus === 'InVan' ? 'වෑන් රථයේ' : 'දෙමාපියන්'} | පාසල: ${rec.schoolStatus}`}
                            >
                              <div className="flex items-center gap-0.5 text-emerald-700">
                                {rec.morningStatus === 'InVan' ? <Bus className="w-3 h-3 text-amber-600" /> : <Users className="w-3 h-3 text-indigo-600" />}
                                <span>{rec.morningTime || '✓'}</span>
                              </div>
                              <div className="text-[9px] text-slate-500 font-medium">
                                {rec.eveningStatus === 'DroppedHome' ? (lang === 'si' ? '🏠 ගෙදරට' : 'Home') : (lang === 'si' ? '🏫 පාසල' : 'School')}
                              </div>
                            </button>
                          )}
                        </td>
                      );
                    })}

                    {/* Attendance summary */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-black ${
                        summary.attendanceRate >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : summary.attendanceRate >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {summary.attendanceRate}%
                      </span>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {summary.schoolPresentDays}/5 {lang === 'si' ? 'දින' : 'days'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

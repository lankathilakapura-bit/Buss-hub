import React, { useState, useEffect } from 'react';
import { 
  SRI_LANKA_VANS, 
  INITIAL_SRI_LANKA_STUDENTS, 
  SriLankaStudent, 
  SriLankaVan,
  generateWhatsAppLink 
} from '../data/sriLankaData';
import { SriLankaVanModal } from './SriLankaVanModal';
import { SriLankaStudentModal } from './SriLankaStudentModal';
import { ParentPortalView } from './ParentPortalView';
import { SriLankaWeekView } from './SriLankaWeekView';
import { SriLankaMonthView } from './SriLankaMonthView';
import {
  HistoryStore,
  MonthlyPaymentStore,
  MonthlyPaymentRecord,
  loadHistoryStore,
  saveHistoryStore,
  loadMonthlyPayments,
  saveMonthlyPayments,
  applyDayToStudents,
  formatDateISO
} from '../data/historyManager';
import { 
  Bus, 
  Phone, 
  MessageSquare, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  School, 
  Home, 
  HelpCircle,
  Sparkles,
  FileSpreadsheet,
  Copy,
  Check,
  Edit2,
  Plus,
  UserPlus,
  HeartHandshake,
  Columns,
  Eye,
  Layers,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  RotateCcw,
  Radio,
  Map as MapIcon
} from 'lucide-react';
import { BusLiveMap } from './BusLiveMap';

export interface SriLankaEasyModeProps {
  page?: 'bus' | 'parent' | 'split' | 'print' | 'sheets';
  onPageChange?: (page: 'bus' | 'parent' | 'split' | 'print' | 'sheets') => void;
}

export const SriLankaEasyMode: React.FC<SriLankaEasyModeProps> = ({
  page = 'bus',
  onPageChange
}) => {
  const [isLiveMapOpen, setIsLiveMapOpen] = useState<boolean>(false);
  const [vans, setVans] = useState<SriLankaVan[]>(() => {
    try {
      const saved = localStorage.getItem('sl_vans_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SRI_LANKA_VANS;
  });

  const [students, setStudents] = useState<SriLankaStudent[]>(() => {
    try {
      const savedV2 = localStorage.getItem('sl_students_v2');
      if (savedV2) return JSON.parse(savedV2);

      const savedV1 = localStorage.getItem('sl_students_v1');
      if (savedV1) {
        // Upgrade from v1, ensuring morningStatus begins unhighlighted ('Pending')
        const parsed: SriLankaStudent[] = JSON.parse(savedV1);
        const unhighlighted = parsed.map(s => ({
          ...s,
          morningStatus: 'Pending' as const,
          morningTime: undefined
        }));
        localStorage.setItem('sl_students_v2', JSON.stringify(unhighlighted));
        return unhighlighted;
      }
    } catch {}
    return INITIAL_SRI_LANKA_STUDENTS;
  });

  const [selectedVan, setSelectedVan] = useState<string>('all');
  const [lang, setLang] = useState<'si' | 'en' | 'ta'>(() => {
    try {
      const savedLang = localStorage.getItem('transittrack_lang');
      if (savedLang === 'en' || savedLang === 'si' || savedLang === 'ta') {
        return savedLang;
      }
    } catch {}
    return 'en'; // Auto select English medium by default
  });

  const handleLangChange = (newLang: 'si' | 'en' | 'ta') => {
    setLang(newLang);
    try {
      localStorage.setItem('transittrack_lang', newLang);
    } catch {}
  };
  const [activeSubTab, setActiveSubTabState] = useState<'bus' | 'parent' | 'split' | 'print' | 'sheets'>(page || 'bus');

  // Timeframe tracking: Day, Week, Month
  const [dataTimeframe, setDataTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateISO(new Date()));
  const [historyStore, setHistoryStore] = useState<HistoryStore>(() => loadHistoryStore(students));
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPaymentStore>(() => loadMonthlyPayments(students));

  const handleUpdatePayment = (yearMonth: string, studentId: string, paymentUpdate: Partial<MonthlyPaymentRecord>) => {
    setMonthlyPayments(prev => {
      const updated = { ...prev };
      if (!updated[yearMonth]) updated[yearMonth] = {};
      const cur = updated[yearMonth][studentId] || { studentId, yearMonth, status: 'Unpaid' };
      updated[yearMonth][studentId] = { ...cur, ...paymentUpdate };
      saveMonthlyPayments(updated);
      return updated;
    });
  };

  const handleUpdateStudentRate = (studentId: string, newRate: number) => {
    setStudents(prev => {
      const updated = prev.map(s => (s.id === studentId ? { ...s, monthlyRate: newRate } : s));
      try {
        localStorage.setItem('sl_students_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Keep internal state in sync with external page prop
  useEffect(() => {
    if (page && page !== activeSubTab) {
      setActiveSubTabState(page);
    }
  }, [page]);

  const setActiveSubTab = (tab: 'bus' | 'parent' | 'split' | 'print' | 'sheets') => {
    setActiveSubTabState(tab);
    if (onPageChange) {
      onPageChange(tab);
    }
  };

  const [selectedParentStudentId, setSelectedParentStudentId] = useState<string>(students[0]?.id || 'sl-1');
  const [copiedSheet, setCopiedSheet] = useState(false);

  const [isVanModalOpen, setIsVanModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<SriLankaStudent | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('sl_vans_v1', JSON.stringify(vans));
    } catch {}
  }, [vans]);

  useEffect(() => {
    try {
      localStorage.setItem('sl_students_v2', JSON.stringify(students));
    } catch {}
  }, [students]);

  // Persist history store whenever updated
  useEffect(() => {
    saveHistoryStore(historyStore);
  }, [historyStore]);

  const filteredStudents = selectedVan === 'all'
    ? students
    : students.filter(s => s.vanNumber === selectedVan);

  // Handle Date Navigation
  const handleDateChange = (newDateStr: string) => {
    // 1. Snapshot current students state into historyStore for selectedDate
    setHistoryStore(prevHistory => {
      const updatedHistory = { ...prevHistory };
      if (!updatedHistory[selectedDate]) {
        updatedHistory[selectedDate] = {};
      }
      students.forEach(s => {
        updatedHistory[selectedDate][s.id] = {
          studentId: s.id,
          dateStr: selectedDate,
          morningStatus: s.morningStatus,
          morningTime: s.morningTime,
          schoolStatus: s.schoolStatus,
          eveningStatus: s.eveningStatus,
          eveningTime: s.eveningTime
        };
      });

      // 2. Apply new date's records to students state
      const updatedStudents = applyDayToStudents(students, newDateStr, updatedHistory);
      setStudents(updatedStudents);

      saveHistoryStore(updatedHistory);
      return updatedHistory;
    });

    setSelectedDate(newDateStr);
  };

  const goToPreviousDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    handleDateChange(formatDateISO(d));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    handleDateChange(formatDateISO(d));
  };

  const goToToday = () => {
    handleDateChange(formatDateISO(new Date()));
  };

  // Update student status & history record simultaneously
  const updateMorning = (id: string, status: SriLankaStudent['morningStatus']) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let resolvedStatus: SriLankaStudent['morningStatus'] = status;

    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      // If clicking the same status, toggle back to 'Pending' (not highlighted)
      resolvedStatus = s.morningStatus === status ? 'Pending' : status;
      return {
        ...s,
        morningStatus: resolvedStatus,
        morningTime: resolvedStatus === 'InVan' ? timeStr : undefined
      };
    }));

    setHistoryStore(prev => {
      const updated = { ...prev };
      if (!updated[selectedDate]) updated[selectedDate] = {};
      const cur = updated[selectedDate][id] || {
        studentId: id,
        dateStr: selectedDate,
        morningStatus: 'Pending',
        schoolStatus: 'Pending',
        eveningStatus: 'Pending'
      };
      const curStatus = cur.morningStatus;
      const targetStatus = curStatus === status ? 'Pending' : status;
      updated[selectedDate][id] = {
        ...cur,
        morningStatus: targetStatus,
        morningTime: targetStatus === 'InVan' ? timeStr : undefined
      };
      return updated;
    });
  };

  const resetAllMorningStatus = () => {
    setStudents(prev => prev.map(s => ({
      ...s,
      morningStatus: 'Pending',
      morningTime: undefined
    })));

    setHistoryStore(prev => {
      const updated = { ...prev };
      if (updated[selectedDate]) {
        Object.keys(updated[selectedDate]).forEach(id => {
          updated[selectedDate][id] = {
            ...updated[selectedDate][id],
            morningStatus: 'Pending',
            morningTime: undefined
          };
        });
      }
      return updated;
    });
  };

  const updateSchool = (id: string, status: SriLankaStudent['schoolStatus']) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, schoolStatus: status } : s)));

    setHistoryStore(prev => {
      const updated = { ...prev };
      if (!updated[selectedDate]) updated[selectedDate] = {};
      const cur = updated[selectedDate][id] || {
        studentId: id,
        dateStr: selectedDate,
        morningStatus: 'Pending',
        schoolStatus: 'Pending',
        eveningStatus: 'Pending'
      };
      updated[selectedDate][id] = {
        ...cur,
        schoolStatus: status
      };
      return updated;
    });
  };

  const updateEvening = (id: string, status: SriLankaStudent['eveningStatus']) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        eveningStatus: status,
        eveningTime: status === 'DroppedHome' ? timeStr : undefined
      };
    }));

    setHistoryStore(prev => {
      const updated = { ...prev };
      if (!updated[selectedDate]) updated[selectedDate] = {};
      const cur = updated[selectedDate][id] || {
        studentId: id,
        dateStr: selectedDate,
        morningStatus: 'Pending',
        schoolStatus: 'Pending',
        eveningStatus: 'Pending'
      };
      updated[selectedDate][id] = {
        ...cur,
        eveningStatus: status,
        eveningTime: status === 'DroppedHome' ? timeStr : undefined
      };
      return updated;
    });
  };

  const handleSaveStudent = (saved: SriLankaStudent) => {
    setStudents(prev => {
      const exists = prev.some(s => s.id === saved.id);
      if (exists) {
        return prev.map(s => s.id === saved.id ? saved : s);
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleRenameVanInStudents = (oldVanNumber: string, newVanNumber: string) => {
    setStudents(prev => prev.map(s => s.vanNumber === oldVanNumber ? { ...s, vanNumber: newVanNumber } : s));
    if (selectedVan === oldVanNumber) {
      setSelectedVan(newVanNumber);
    }
  };

  // Critical alert check: Got in van in morning, but absent at school
  const criticalAlerts = students.filter(s => s.morningStatus === 'InVan' && s.schoolStatus === 'Absent');

  // Copy 4-column simplified sheet
  const copySimpleSheet = () => {
    const tsvRows = [
      ['දිනය / Date', 'ළමයාගේ නම (Student Name)', 'උදේ වෑන් (Morning Van)', 'පාසල (School Presence)', 'හවස වෑන් (Evening Van)', 'දෙමාපිය දුරකථනය (Parent Phone)'],
      ...students.map(s => [
        new Date().toISOString().split('T')[0],
        s.name + (s.nameSi ? ` (${s.nameSi})` : ''),
        s.morningStatus === 'InVan' ? 'නැග්ගා (Yes)' : s.morningStatus === 'Absent' ? 'නෑ (Absent)' : 'වෙනත් (Other)',
        s.schoolStatus === 'Present' ? 'පැමිණියා (Present)' : 'නොපැමිණියා (Absent)',
        s.eveningStatus === 'DroppedHome' ? 'භාරදුන්නා (Dropped)' : s.eveningStatus === 'InVan' ? 'නැග්ගා (In Van)' : 'නෑ (No)',
        s.parentPhone
      ])
    ];

    const tsv = tsvRows.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(tsv);
    setCopiedSheet(true);
    setTimeout(() => setCopiedSheet(false), 2500);
  };

  const renderBusTransitSection = (isSplitLayout: boolean) => (
    <div className="space-y-4">
      {/* TIMEFRAME SELECTOR (Day, Week Data, Month Data) & DATE CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setDataTimeframe('day')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              dataTimeframe === 'day'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-900" />
            <span>{lang === 'si' ? '☀️ දෛනික සටහන (Daily)' : 'Daily Transit'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDataTimeframe('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              dataTimeframe === 'week'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-slate-900" />
            <span>{lang === 'si' ? '📅 සතියේ සටහන් (Week Data)' : 'Week Data'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDataTimeframe('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              dataTimeframe === 'month'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-900" />
            <span>{lang === 'si' ? '📊 මාසික වාර්තාව (Month Data)' : 'Month Data'}</span>
          </button>
        </div>

        {/* Date Navigator Bar when in Daily view */}
        {dataTimeframe === 'day' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={goToPreviousDay}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title="පෙර දිනය (Previous Day)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => e.target.value && handleDateChange(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-900 cursor-pointer focus:outline-hidden"
              />
            </div>

            <button
              type="button"
              onClick={goToNextDay}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title="මීළඟ දිනය (Next Day)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors ${
                selectedDate === formatDateISO(new Date())
                  ? 'bg-slate-900 text-white'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
              }`}
            >
              {lang === 'si' ? 'අද (Today)' : 'Today'}
            </button>
          </div>
        )}
      </div>

      {/* RENDER WEEK DATA VIEW */}
      {dataTimeframe === 'week' && (
        <SriLankaWeekView
          currentDateStr={selectedDate}
          students={students}
          vans={vans}
          selectedVan={selectedVan}
          history={historyStore}
          lang={lang}
          onSelectDate={d => {
            handleDateChange(d);
            setDataTimeframe('day');
          }}
        />
      )}

      {/* RENDER MONTH DATA VIEW */}
      {dataTimeframe === 'month' && (
        <SriLankaMonthView
          currentDateStr={selectedDate}
          students={students}
          vans={vans}
          selectedVan={selectedVan}
          history={historyStore}
          lang={lang}
          onSelectDate={d => {
            handleDateChange(d);
            setDataTimeframe('day');
          }}
          onUpdateStudentRate={handleUpdateStudentRate}
          paymentStore={monthlyPayments}
          onUpdatePayment={handleUpdatePayment}
        />
      )}

      {/* RENDER DAILY CHECK-IN VIEW */}
      {dataTimeframe === 'day' && (
        <>
          {/* Historical Date Notice if not today */}
          {selectedDate !== formatDateISO(new Date()) && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>
                  {lang === 'si'
                    ? `ඔබ නරඹන්නේ අතීත දිනයක සටහන්: ${selectedDate}. මෙහි සිදුකරන වෙනස්කම් එම දිනයට සටහන් වේ.`
                    : `Viewing historical transit register for ${selectedDate}. Edits will be saved to this date.`}
                </span>
              </div>
              <button
                type="button"
                onClick={goToToday}
                className="font-black text-amber-900 underline hover:text-amber-950"
              >
                {lang === 'si' ? 'අද දිනයට ආපසු යන්න' : 'Return to Today'}
              </button>
            </div>
          )}

          {/* Van Filter Bar & Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700">වෑන් රථය / Van:</span>
          <select
            value={selectedVan}
            onChange={e => setSelectedVan(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">සියලුම වෑන් රථ (All Vans - {students.length} ළමුන්)</option>
            {vans.map(v => (
              <option key={v.vanNumber} value={v.vanNumber}>
                {v.vanNumber} - {v.driverName} ({v.routeTitle})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Action Buttons: Bus Map, Edit Vans, Add Student & Reset Marks */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsLiveMapOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border border-amber-400/80 hover:scale-[1.02]"
            title={lang === 'si' ? 'සජීවී බස් සිතියම - PickMe මෙන් වෑන් රථය සජීවීව බලන්න' : 'Live GPS Bus Map - Track the van live like PickMe'}
          >
            <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
            <span>{lang === 'si' ? '🗺️ සජීවී බස් Map' : '🗺️ Bus Map (Live GPS)'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-ping"></span>
          </button>

          <button
            type="button"
            onClick={resetAllMorningStatus}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            title={lang === 'si' ? 'උදෑසන සලකුණු (නැග්ගා/නෑ/දෙමාපියන්) ඉවත් කර නැවත මුල සිට ආරම්භ කරන්න' : 'Reset all morning attendance to unhighlighted'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>{lang === 'si' ? '🔄 සියල්ල Unmark' : 'Reset Marks'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVanModalOpen(true)}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            title="පාසල් වෑන් රථ සහ රියදුරු තොරතුරු සංස්කරණය"
          >
            <Bus className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'si' ? '🚐 වෑන් සංස්කරණය' : 'Edit Vans'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingStudent(null);
              setIsAddStudentOpen(true);
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'si' ? '➕ අලුත් ළමයෙක්' : 'Add Student'}</span>
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className={`grid gap-4 ${isSplitLayout ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredStudents.map(student => {
          const isMissingAlert = student.morningStatus === 'InVan' && student.schoolStatus === 'Absent';
          const isSelectedForParent = selectedParentStudentId === student.id;

          return (
            <div
              key={student.id}
              className={`bg-white rounded-2xl border-2 p-4 shadow-sm space-y-3 transition-all ${
                isMissingAlert
                  ? 'border-red-500 bg-red-50/20 ring-2 ring-red-300'
                  : isSelectedForParent && isSplitLayout
                  ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/20'
                  : student.morningStatus === 'InVan'
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header: Student Name & Halting Place + Edit Button */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5 flex-wrap">
                    <span>{student.name}</span>
                    {student.nameSi && (
                      <span className="text-xs font-semibold text-slate-600 font-sans">
                        ({student.nameSi})
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                      {student.grade}
                    </span>
                    <span>· {student.vanNumber.split(' ')[0]}</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-1 flex items-center gap-2 flex-wrap">
                    <div>
                      <span className="text-slate-400">නැවතුම / Stop:</span>{' '}
                      <span className="font-bold text-amber-800">{student.pickupLocation}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDataTimeframe('month')}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                        monthlyPayments[selectedDate.substring(0, 7)]?.[student.id]?.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                      title={lang === 'si' ? 'මාසික ගාස්තු සහ ගෙවීම් වාර්තාව බලන්න (Month Data)' : 'View monthly fee & payment'}
                    >
                      <span>💰 Rs. {(student.monthlyRate || 7500).toLocaleString()}</span>
                      <span>·</span>
                      <span>
                        {monthlyPayments[selectedDate.substring(0, 7)]?.[student.id]?.status === 'Paid'
                          ? (lang === 'si' ? 'ගෙවා ඇත ✓' : 'Paid ✓')
                          : (lang === 'si' ? 'ගෙවීමට ඇත' : 'Due')}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedParentStudentId(student.id);
                      setActiveSubTab('parent');
                    }}
                    className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                      isSelectedForParent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                    }`}
                    title="2 වන පිටුව: දෙමාපිය පිටුවෙන් මේ ළමයාගේ සජීවී තත්ත්වය බලන්න"
                  >
                    <Eye className="w-3 h-3 text-indigo-500" />
                    <span>{lang === 'si' ? '2 වන පිටුව (Parent)' : '2nd Page (Parent)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingStudent(student)}
                    className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-bold transition-colors"
                    title={lang === 'si' ? 'ළමයාගේ විස්තර හෝ වෑන් එක වෙනස් කරන්න' : 'Edit student or assigned van'}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              </div>

              {/* 1. MORNING VAN BUTTONS (BIG FOR VAN UNCLE) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                  <span>
                    {lang === 'si' ? '1. උදෑසන වෑන් රථය:' : '1. Morning Van Status:'}
                  </span>
                  {student.morningTime && (
                    <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                      {student.morningTime}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      updateMorning(student.id, 'InVan');
                      setSelectedParentStudentId(student.id);
                    }}
                    className={`min-h-[46px] rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center p-1.5 shadow-xs ${
                      student.morningStatus === 'InVan'
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-700 scale-102'
                        : 'bg-slate-100 hover:bg-emerald-100 text-slate-800'
                    }`}
                  >
                    <span className="text-sm">🟢</span>
                    <span>{lang === 'si' ? 'නැග්ගා' : 'In Van'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateMorning(student.id, 'Absent');
                      setSelectedParentStudentId(student.id);
                    }}
                    className={`min-h-[46px] rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center p-1.5 shadow-xs ${
                      student.morningStatus === 'Absent'
                        ? 'bg-red-600 text-white ring-2 ring-red-700'
                        : 'bg-slate-100 hover:bg-red-100 text-slate-800'
                    }`}
                  >
                    <span className="text-sm">🔴</span>
                    <span>{lang === 'si' ? 'අද නෑ' : 'Absent'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateMorning(student.id, 'WithParent');
                      setSelectedParentStudentId(student.id);
                    }}
                    className={`min-h-[46px] rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center p-1.5 shadow-xs ${
                      student.morningStatus === 'WithParent'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-700'
                        : 'bg-slate-100 hover:bg-blue-100 text-slate-800'
                    }`}
                  >
                    <span className="text-sm">🚙</span>
                    <span>{lang === 'si' ? 'දෙමාපියන්' : 'Parent'}</span>
                  </button>
                </div>
              </div>

              {/* 2. SCHOOL PRESENCE & EVENING DROP */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-blue-900 block">
                    {lang === 'si' ? '2. පාසලට ආවද?' : '2. At School?'}
                  </span>
                  <select
                    value={student.schoolStatus}
                    onChange={e => {
                      updateSchool(student.id, e.target.value as any);
                      setSelectedParentStudentId(student.id);
                    }}
                    className={`w-full text-xs font-bold p-2 rounded-xl border ${
                      student.schoolStatus === 'Present'
                        ? 'bg-blue-50 text-blue-900 border-blue-400 font-black'
                        : student.schoolStatus === 'Absent'
                        ? 'bg-red-50 text-red-900 border-red-400 font-black'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="Present">✅ පන්තියට ආවා (Present)</option>
                    <option value="Absent">❌ නොපැමිණියා (Absent)</option>
                    <option value="Pending">⏳ බලාපොරොත්තුවෙන්</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-950 block">
                    {lang === 'si' ? '3. හවස ගෙදරට:' : '3. PM Drop:'}
                  </span>
                  <select
                    value={student.eveningStatus}
                    onChange={e => {
                      updateEvening(student.id, e.target.value as any);
                      setSelectedParentStudentId(student.id);
                    }}
                    className={`w-full text-xs font-bold p-2 rounded-xl border ${
                      student.eveningStatus === 'DroppedHome'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-black'
                        : student.eveningStatus === 'InVan'
                        ? 'bg-amber-50 text-amber-900 border-amber-400 font-black'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="DroppedHome">🏠 ගෙදරට බැස්සුවා (Dropped)</option>
                    <option value="InVan">🚌 හවස නැග්ගා (In Van)</option>
                    <option value="ParentPickup">🚙 දෙමාපියන් ගත්තා (Parent)</option>
                    <option value="Absent">❌ නෑ (Absent)</option>
                    <option value="Pending">⏳ සවස (Pending)</option>
                  </select>
                </div>
              </div>

              {/* 3. ONE-TAP WHATSAPP & PHONE TO PARENT */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={generateWhatsAppLink(
                    student.parentPhone,
                    student.name,
                    student.morningStatus === 'InVan' ? 'boarded' : student.morningStatus === 'Absent' ? 'absent' : 'dropped',
                    student.morningTime || '07:00 AM',
                    lang
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors px-2"
                  title="WhatsApp මගින් දෙමාපියන්ට පණිවිඩයක් යවන්න"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{lang === 'si' ? 'WhatsApp යවන්න' : 'Send WhatsApp'}</span>
                </a>

                <a
                  href={`tel:${student.parentPhone}`}
                  className="min-h-[42px] px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  title="දෙමාපියන්ට කෝල් කරන්න"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{student.parentPhone}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Banner for Sri Lankan Context */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-2xl p-4 sm:p-6 text-slate-950 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-amber-700 shrink-0 font-bold text-2xl">
              🇱🇰
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                  {lang === 'si' ? 'ලංකාවේ පාසල් වෑන් පහසු ක්‍රමය' : lang === 'ta' ? 'இலங்கை பள்ளி வேன் எளிய முறை' : 'Sri Lanka School Van Easy Mode'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-950 text-amber-400">
                  {lang === 'si' ? 'අංකල්ලාට සහ දෙමාපියන්ට ලේසිම ක්‍රමය' : 'Driver & Parent Friendly'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-900 mt-0.5">
                {lang === 'si'
                  ? 'English හෝ formula ඕනෙ නෑ! තනි click එකෙන් ළමයි සටහන් කරගෙන WhatsApp එකෙන් අම්මාට/තාත්තාට පණිවිඩ යවන්න.'
                  : lang === 'ta'
                  ? 'கடினமான ஃபார்முலா தேவையில்லை! ஒரே கிளிக்கில் பிள்ளைகளை குறித்து WhatsApp மூலம் பெற்றோருக்கு செய்தி அனுப்புங்கள்.'
                  : 'No complicated formulas needed! 1-tap buttons for drivers and instant WhatsApp notifications for parents.'}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-white/90 p-1.5 rounded-xl border border-amber-400/50 self-start sm:self-auto shrink-0 shadow-xs">
            <span className="text-[11px] font-bold text-slate-700 px-1">Language / භාෂාව:</span>
            <button
              type="button"
              onClick={() => handleLangChange('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'en' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('si')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'si' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              සිංහල
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('ta')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'ta' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Primary 2-Page Selector: 1st Page for Bus, 2nd Page for Parents */}
        <div className="mt-5 pt-4 border-t border-amber-600/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1st Page Button: School Bus */}
            <button
              onClick={() => setActiveSubTab('bus')}
              className={`p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-3 ${
                activeSubTab === 'bus'
                  ? 'bg-slate-950 text-white shadow-lg ring-2 ring-amber-300 scale-[1.01]'
                  : 'bg-white/85 hover:bg-white text-slate-900 shadow-xs border border-white/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                  activeSubTab === 'bus' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  🚌 1
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${
                      activeSubTab === 'bus' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {lang === 'si' ? '1 වන පිටුව' : '1st Page'}
                    </span>
                    <span className="font-black text-sm sm:text-base">
                      {lang === 'si' ? 'පාසල් බස් / වෑන් රථය' : 'The School Bus'}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${activeSubTab === 'bus' ? 'text-slate-300 font-medium' : 'text-slate-600'}`}>
                    {lang === 'si' ? 'රියදුරු අංකල් සහ පාසල් පැමිණීමේ ලේඛනය' : 'Driver transit attendance check-in & contact'}
                  </p>
                </div>
              </div>

              {activeSubTab === 'bus' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase shrink-0">
                  {lang === 'si' ? 'දැන් ක්‍රියාකාරී' : 'Active'}
                </span>
              )}
            </button>

            {/* 2nd Page Button: Parents */}
            <button
              onClick={() => setActiveSubTab('parent')}
              className={`p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-3 ${
                activeSubTab === 'parent'
                  ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300 scale-[1.01]'
                  : 'bg-white/85 hover:bg-white text-slate-900 shadow-xs border border-white/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                  activeSubTab === 'parent' ? 'bg-white text-indigo-700 shadow-xs' : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                }`}>
                  👨‍👩‍👧 2
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${
                      activeSubTab === 'parent' ? 'bg-white text-indigo-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {lang === 'si' ? '2 වන පිටුව' : '2nd Page'}
                    </span>
                    <span className="font-black text-sm sm:text-base">
                      {lang === 'si' ? 'දෙමාපියන්ගේ පිටුව' : 'The Parents'}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${activeSubTab === 'parent' ? 'text-indigo-100 font-medium' : 'text-slate-600'}`}>
                    {lang === 'si' ? 'දරුවා සිටින තැන සහ සජීවී තොරතුරු' : 'Real-time child status & driver direct contact'}
                  </p>
                </div>
              </div>

              {activeSubTab === 'parent' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-indigo-700 uppercase shrink-0">
                  {lang === 'si' ? 'දැන් ක්‍රියාකාරී' : 'Active'}
                </span>
              )}
            </button>
          </div>

          {/* Secondary Utility Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveSubTab('split')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeSubTab === 'split'
                    ? 'bg-slate-950 text-white shadow-md ring-1 ring-amber-300'
                    : 'bg-white/70 hover:bg-white text-slate-800'
                }`}
                title="දෙපැත්තම එක ළඟ (Side-by-Side Dual View)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? '⇄ දෙපැත්තම එක ළඟ (Side-by-Side)' : 'Side-by-Side'}</span>
              </button>

              <button
                onClick={() => setActiveSubTab('print')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeSubTab === 'print'
                    ? 'bg-slate-950 text-white shadow-md ring-1 ring-amber-300'
                    : 'bg-white/70 hover:bg-white text-slate-800'
                }`}
                title="A4 කොළයකට print කරගෙන ලකුණු කරන්න"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'si' ? 'A4 මුද්‍රණය (Print)' : 'A4 Print'}</span>
              </button>

              <button
                onClick={() => setActiveSubTab('sheets')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeSubTab === 'sheets'
                    ? 'bg-slate-950 text-white shadow-md ring-1 ring-amber-300'
                    : 'bg-white/70 hover:bg-white text-slate-800'
                }`}
                title="Google Sheet එකට copy කරගන්න"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>{lang === 'si' ? 'Google Sheet' : 'Sheet Export'}</span>
              </button>
            </div>

            <div className="text-[11px] font-bold text-slate-900 bg-amber-400/50 px-2.5 py-1 rounded-lg">
              {lang === 'si' ? '1 වන පිටුව: බස් රථය ⇄ 2 වන පිටුව: දෙමාපියන්' : '1st: Bus · 2nd: Parents'}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Safety Alert Banner if any student boarded but is missing at school */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 text-red-950 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-600 text-white rounded-xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-sm sm:text-base text-red-900">
                {lang === 'si'
                  ? `අවධානයයි: ළමයින් ${criticalAlerts.length} දෙනෙක් උදේ වෑන් එකට නැග්ගා, නමුත් ඉස්කෝලෙට ඇවිත් නෑ!`
                  : `URGENT ALERT: ${criticalAlerts.length} student(s) boarded morning van but missing at school!`}
              </h2>
              <div className="mt-2 space-y-2">
                {criticalAlerts.map(c => (
                  <div key={c.id} className="bg-white p-2.5 rounded-xl border border-red-200 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{c.name} {c.nameSi && `(${c.nameSi})`}</span>
                      <span className="text-xs text-slate-500 ml-2">වෑන් එක: {c.vanNumber}</span>
                      <p className="text-xs text-red-700 mt-0.5">උදෑසන {c.morningTime} ට වෑන් එකට නැග්ගා. පන්තියේ නොපැමිණි බව සටහන්ව ඇත.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${c.parentPhone}`}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>කෝල් කරන්න: {c.parentPhone}</span>
                      </a>
                      <a
                        href={generateWhatsAppLink(c.parentPhone, c.name, 'alert', c.morningTime || '07:00 AM', lang)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Alert</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: DUAL SIDE-BY-SIDE VIEW (One side bus, other side parent) */}
      {activeSubTab === 'split' && (
        <div className="space-y-4">
          {/* Visual indicator of live dual sync */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                ⇄
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                  <span>{lang === 'si' ? 'දෙපැත්තම එක ළඟ සජීවී ක්‍රමය (Side-by-Side Dual View)' : 'Side-by-Side Dual View'}</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {lang === 'si' ? 'තත්‍ය කාලීන' : 'Live Sync'}
                  </span>
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {lang === 'si'
                    ? 'වම් පැත්ත: බස් / වෑන් රියදුරු සටහන් (Bus Page) ⇄ දකුණු පැත්ත: දෙමාපිය පිටුව (Parent Page) — එක පැත්තක වෙනස්කම් අනෙක් පැත්තට ක්ෂණිකව ලැබේ!'
                    : 'Left: School Bus transit controls ⇄ Right: Live Parent Portal view with real-time updates.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{lang === 'si' ? 'සම්බන්ධ වී ඇත' : 'Connected'}</span>
            </div>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column: Bus Transit Page (7 cols on xl) */}
            <div className="xl:col-span-7 space-y-3">
              <div className="bg-amber-100 border border-amber-300/80 px-4 py-2.5 rounded-2xl text-amber-950 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
                  <Bus className="w-4 h-4 text-amber-700" />
                  <span>{lang === 'si' ? '🚌 වම් පැත්ත: බස් / වෑන් රථයේ තිරය (Bus Page)' : 'Left: Bus Transit Page'}</span>
                </div>
                <span className="text-[11px] font-bold bg-white/80 px-2 py-0.5 rounded-lg text-amber-900 border border-amber-200">
                  {filteredStudents.length} {lang === 'si' ? 'ළමුන්' : 'students'}
                </span>
              </div>
              {renderBusTransitSection(true)}
            </div>

            {/* Right Column: Parent Portal Page (5 cols on xl, sticky) */}
            <div className="xl:col-span-5 space-y-3 xl:sticky xl:top-20">
              <div className="bg-indigo-100 border border-indigo-300/80 px-4 py-2.5 rounded-2xl text-indigo-950 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
                  <HeartHandshake className="w-4 h-4 text-indigo-700" />
                  <span>{lang === 'si' ? '👨‍👩‍👧 දකුණු පැත්ත: දෙමාපියන්ගේ පිටුව (Parent Page)' : 'Right: Parent Page'}</span>
                </div>
                <span className="text-[11px] font-bold bg-white/80 px-2 py-0.5 rounded-lg text-indigo-900 border border-indigo-200">
                  {lang === 'si' ? 'දෙමාපිය දර්ශනය' : 'Parent View'}
                </span>
              </div>
              <ParentPortalView
                students={students}
                vans={vans}
                lang={lang}
                selectedStudentId={selectedParentStudentId}
                onSelectStudentId={setSelectedParentStudentId}
                compact={true}
                history={historyStore}
                currentDateStr={selectedDate}
                paymentStore={monthlyPayments}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: 1ST PAGE FOR THE BUS (Full Bus Transit Screen) */}
      {activeSubTab === 'bus' && (
        <div className="space-y-4">
          {/* Top 1st Page Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 border-2 border-amber-500 p-4 sm:p-5 rounded-2xl text-slate-950 flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                1
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                    <Bus className="w-5 h-5 text-slate-950" />
                    <span>{lang === 'si' ? '1 වන පිටුව: පාසල් බස් / වෑන් රථයේ සටහන් (Bus Page)' : '1st Page: School Bus Transit Controls'}</span>
                  </h2>
                  <span className="text-[11px] font-extrabold bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full">
                    {lang === 'si' ? 'රියදුරු අංකල් සහ පාසල් කාර්ය මණ්ඩලය' : 'For Bus Driver & School Staff'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-900 font-medium mt-0.5">
                  {lang === 'si'
                    ? '1. උදෑසන නැග්ගාද, 2. පන්තියට ආවාද, 3. හවස ගෙදරට බැස්සුවාද යන්න මෙතැනින් ලකුණු කරන්න.'
                    : '1-tap check-in for morning van pickup, classroom presence, and afternoon home drop-off.'}
                </p>
              </div>
            </div>

            {/* Prominent CTA to switch to 2nd Page (Parents) */}
            <button
              onClick={() => setActiveSubTab('parent')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all hover:scale-102 cursor-pointer"
              title="2 වන පිටුව: දෙමාපියන්ගේ සජීවී පිටුවට මාරුවන්න"
            >
              <span>{lang === 'si' ? '2 වන පිටුව: දෙමාපියන්ගේ පිටුවට යන්න' : 'Go to 2nd Page: Parents Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Full Bus Transit Section */}
          {renderBusTransitSection(false)}

          {/* Bottom Switcher Card to 2nd Page */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                2
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm text-indigo-950">
                  {lang === 'si' ? 'දෙමාපියන්ගේ සජීවී තොරතුරු පිටුව බලන්න අවශ්‍යද?' : 'Want to view what parents see right now?'}
                </div>
                <div className="text-[11px] sm:text-xs text-indigo-700 mt-0.5">
                  {lang === 'si' ? 'දෙමාපියන්ට දරුවාගේ තොරතුරු ලැබෙන ආකාරය 2 වන පිටුවෙන් බලන්න.' : 'Switch to the 2nd page to inspect the real-time live parent portal.'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('parent')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>{lang === 'si' ? '2 වන පිටුවට යන්න ➜' : 'Switch to 2nd Page ➜'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: 2ND PAGE FOR THE PARENTS (Full Parent Live Screen) */}
      {activeSubTab === 'parent' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Top 2nd Page Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 border-2 border-indigo-500 p-4 sm:p-5 rounded-2xl text-white flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white text-indigo-700 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                2
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-indigo-300" />
                    <span>{lang === 'si' ? '2 වන පිටුව: දෙමාපියන්ගේ සජීවී පිටුව (Parents Page)' : '2nd Page: Parents Live Tracking Portal'}</span>
                  </h2>
                  <span className="text-[11px] font-extrabold bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/30">
                    {lang === 'si' ? 'දෙමාපියන් සඳහා' : 'For Parents & Guardians'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-100 font-medium mt-0.5">
                  {lang === 'si'
                    ? 'ඔබේ දරුවා බස් රථයට නැග්ගාද, පාසලට පැමිණියාද සහ ගෙදරට පැමිණෙන වේලාව සජීවීව බලාගන්න.'
                    : 'Live child status, bus journey timeline, driver phone & direct WhatsApp connection.'}
                </p>
              </div>
            </div>

            {/* Prominent CTA to switch back to 1st Page (Bus) */}
            <button
              onClick={() => setActiveSubTab('bus')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all hover:scale-102 cursor-pointer"
              title="1 වන පිටුව: පාසල් බස් රථයේ පිටුවට මාරුවන්න"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'si' ? '1 වන පිටුව: බස් රථයේ පිටුවට යන්න' : 'Back to 1st Page: The Bus'}</span>
            </button>
          </div>

          {/* Full Parent Portal View */}
          <ParentPortalView
            students={students}
            vans={vans}
            lang={lang}
            selectedStudentId={selectedParentStudentId}
            onSelectStudentId={setSelectedParentStudentId}
            compact={false}
            history={historyStore}
            currentDateStr={selectedDate}
            paymentStore={monthlyPayments}
          />

          {/* Bottom Switcher Card back to 1st Page */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                1
              </div>
              <div>
                <div className="font-black text-xs sm:text-sm text-amber-950">
                  {lang === 'si' ? 'පාසල් බස් රථයේ හෝ වෑන් රථයේ ලකුණු කරන්න අවශ්‍යද?' : 'Are you the bus driver or attendance staff?'}
                </div>
                <div className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                  {lang === 'si' ? 'ළමුන්ගේ පැමිණීම සටහන් කිරීමට 1 වන පිටුවට යන්න.' : 'Switch back to the 1st page to record student transit attendance.'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('bus')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>{lang === 'si' ? '1 වන පිටුවට යන්න ➜' : 'Switch to 1st Page ➜'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: PRINTABLE A4 PAPER SHEET */}
      {activeSubTab === 'print' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {lang === 'si' ? 'පාසල් වෑන් පැමිණීමේ ලේඛනය (A4 Print Version)' : 'School Van Daily Attendance Roster (Printable A4)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'si'
                  ? 'වෑන් අංකල්ට Phone එකෙන් වැඩකරන්න අමාරුනම්, මේ sheet එක A4 කොළයකට print කරගෙන පෑනෙන් ලකුණු කරන්න දෙන්න!'
                  : 'If drivers prefer pen and paper, print this clean daily roster for their clipboard!'}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print A4 Sheet</span>
            </button>
          </div>

          {/* Print preview table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden print:border-black">
            <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs font-bold text-slate-800">
              <div>වෑන් අංකය / Van: {selectedVan === 'all' ? 'Van 01 (WP ND-4215)' : selectedVan}</div>
              <div>දිනය / Date: ........................................</div>
              <div>රියදුරු / Driver: ........................................</div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-800 border-b border-slate-300 font-bold">
                  <th className="p-2.5 border-r border-slate-300 w-10 text-center">#</th>
                  <th className="p-2.5 border-r border-slate-300">ළමයාගේ නම (Student Name)</th>
                  <th className="p-2.5 border-r border-slate-300">පන්තිය (Grade)</th>
                  <th className="p-2.5 border-r border-slate-300">නැවතුම (Pickup Stop)</th>
                  <th className="p-2.5 border-r border-slate-300 text-center w-24">උදේ නැග්ගා (AM In)</th>
                  <th className="p-2.5 border-r border-slate-300 text-center w-24">පාසල (School)</th>
                  <th className="p-2.5 border-r border-slate-300 text-center w-24">හවස බැස්සා (PM Drop)</th>
                  <th className="p-2.5">දෙමාපිය දුරකථනය (Phone)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2.5 border-r border-slate-300 text-center font-bold text-slate-600">{idx + 1}</td>
                    <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900">
                      {s.name} {s.nameSi && <span className="font-normal text-slate-600">({s.nameSi})</span>}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 text-slate-700">{s.grade}</td>
                    <td className="p-2.5 border-r border-slate-300 text-slate-700">{s.pickupLocation}</td>
                    <td className="p-2.5 border-r border-slate-300 text-center text-slate-400">[ &nbsp; ]</td>
                    <td className="p-2.5 border-r border-slate-300 text-center text-slate-400">[ &nbsp; ]</td>
                    <td className="p-2.5 border-r border-slate-300 text-center text-slate-400">[ &nbsp; ]</td>
                    <td className="p-2.5 font-mono text-slate-800 font-medium">{s.parentPhone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: SUPER SIMPLE 4-COLUMN GOOGLE SHEET */}
      {activeSubTab === 'sheets' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {lang === 'si' ? 'හරිම සරල 4-Column Google Sheet ක්‍රමය' : 'Ultra Simple 4-Column Google Sheet'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'si'
                  ? 'සංකීර්ණ formulas මොකුත් නැතුව, ඕනෑම කෙනෙකුට තත්පර 30කින් හදාගත හැකි සරලම Sheet එක.'
                  : 'Zero formulas needed. Anyone can set this up in Google Sheets in 30 seconds.'}
              </p>
            </div>

            <button
              onClick={copySimpleSheet}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              {copiedSheet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSheet ? 'Copied to Clipboard!' : 'Copy Simple Table for Google Sheets'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-mono text-xs font-bold text-amber-700">Column A</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">ළමයාගේ නම (Student Name)</h4>
              <p className="text-xs text-slate-500 mt-1">කවීෂා පෙරේරා, දිනුක ප්‍රනාන්දු...</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="font-mono text-xs font-bold text-amber-700">Column B</span>
              <h4 className="font-bold text-amber-950 text-sm mt-1">උදේ වෑන් (Morning Van)</h4>
              <p className="text-xs text-amber-800 mt-1">Drop-down: [නැග්ගා / නෑ / දෙමාපියන්]</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="font-mono text-xs font-bold text-blue-700">Column C</span>
              <h4 className="font-bold text-blue-950 text-sm mt-1">පාසල (School Presence)</h4>
              <p className="text-xs text-blue-800 mt-1">Drop-down: [පැමිණියා / නොපැමිණියා]</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="font-mono text-xs font-bold text-emerald-700">Column D</span>
              <h4 className="font-bold text-emerald-950 text-sm mt-1">හවස බැස්සා (PM Home Drop)</h4>
              <p className="text-xs text-emerald-800 mt-1">Drop-down: [බැස්සුවා / දෙමාපියන්]</p>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-slate-800 space-y-2">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ලංකාවේ පාසල් සඳහා ඉතා වැදගත් උපදෙසක්:</span>
            </h4>
            <p>
              1. <strong>Google Sheets App</strong> එක වෑන් අංකල්ගේ හෝ ආන්ටිගේ Phone එකට install කරලා, Drop-down එකක් දැම්මම අංකල්ට අකුරු ටයිප් කරන්න ඕනෙ නෑ — ඇඟිල්ලෙන් "නැග්ගා" කියලා තෝරන්න විතරයි තියෙන්නෙ.
            </p>
            <p>
              2. නැත්නම්, අපේ <strong>Live App එකේ "Driver Live Screen"</strong> එක දුන්නම WhatsApp එකත් එක්කම එක click එකෙන් වැඩේ ඉවරයි!
            </p>
          </div>
        </div>
      )}

      {/* Sri Lanka Live GPS Bus Map Modal (PickMe Style) */}
      {isLiveMapOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-3xl">
            <BusLiveMap
              onClose={() => setIsLiveMapOpen(false)}
              students={students}
              initialVanNumber={selectedVan !== 'all' ? selectedVan : undefined}
              lang={lang}
              onStudentBoarded={(studentId) => {
                updateMorning(studentId, 'InVan');
              }}
            />
          </div>
        </div>
      )}

      {/* Sri Lanka Van Edit & Add Modal */}
      <SriLankaVanModal
        isOpen={isVanModalOpen}
        onClose={() => setIsVanModalOpen(false)}
        vans={vans}
        students={students}
        lang={lang}
        onSaveVans={setVans}
        onRenameVanInStudents={handleRenameVanInStudents}
      />

      {/* Sri Lanka Student Edit & Add Modal */}
      {(editingStudent !== null || isAddStudentOpen) && (
        <SriLankaStudentModal
          isOpen={true}
          onClose={() => {
            setEditingStudent(null);
            setIsAddStudentOpen(false);
          }}
          student={editingStudent}
          vans={vans}
          lang={lang}
          onSave={handleSaveStudent}
          onDelete={handleDeleteStudent}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  HistoryStore,
  MonthlyPaymentStore,
  MonthlyPaymentRecord,
  getMonthDays,
  calculateStudentMonthlySummary,
  loadMonthlyPayments,
  saveMonthlyPayments,
  formatDateISO
} from '../data/historyManager';
import {
  SriLankaStudent,
  SriLankaVan,
  generateFeeReminderWhatsAppLink,
  generateFeeReceiptWhatsAppLink
} from '../data/sriLankaData';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bus,
  School,
  Printer,
  Copy,
  Check,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Edit2,
  DollarSign,
  TrendingUp,
  Filter,
  CheckCheck,
  Save,
  X
} from 'lucide-react';

interface SriLankaMonthViewProps {
  currentDateStr: string;
  students: SriLankaStudent[];
  vans: SriLankaVan[];
  selectedVan: string;
  history: HistoryStore;
  lang: 'si' | 'en' | 'ta';
  onSelectDate: (dateStr: string) => void;
  onUpdateStudentRate?: (studentId: string, newRate: number) => void;
  paymentStore?: MonthlyPaymentStore;
  onUpdatePayment?: (yearMonth: string, studentId: string, payment: Partial<MonthlyPaymentRecord>) => void;
}

export const SriLankaMonthView: React.FC<SriLankaMonthViewProps> = ({
  currentDateStr,
  students,
  vans,
  selectedVan,
  history,
  lang,
  onSelectDate,
  onUpdateStudentRate,
  paymentStore: externalPaymentStore,
  onUpdatePayment: externalUpdatePayment
}) => {
  const [curDate, setCurDate] = useState(() => {
    const [y, m] = currentDateStr.split('-').map(Number);
    return { year: y || 2026, month: m || 9 };
  });

  const [copied, setCopied] = useState(false);
  const [payFilter, setPayFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Internal payment store fallback if not controlled from top level
  const [internalPaymentStore, setInternalPaymentStore] = useState<MonthlyPaymentStore>(() =>
    loadMonthlyPayments(students)
  );

  const activePaymentStore = externalPaymentStore || internalPaymentStore;

  // Editing individual student monthly rate inline
  const [editingRateStudentId, setEditingRateStudentId] = useState<string | null>(null);
  const [editingRateValue, setEditingRateValue] = useState<number>(7500);

  // Payment detail modal state
  const [paymentModalStudent, setPaymentModalStudent] = useState<SriLankaStudent | null>(null);
  const [modalPayStatus, setModalPayStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [modalPayAmount, setModalPayAmount] = useState<number>(7500);
  const [modalPayDate, setModalPayDate] = useState<string>(formatDateISO(new Date()));
  const [modalPayMethod, setModalPayMethod] = useState<'Cash' | 'Bank Transfer' | 'Other'>('Cash');
  const [modalPayNote, setModalPayNote] = useState<string>('');

  const yearMonthKey = `${curDate.year}-${String(curDate.month).padStart(2, '0')}`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesSi = [
    'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
    'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'
  ];

  const handlePrevMonth = () => {
    setCurDate(prev => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurDate(prev => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const monthDays = getMonthDays(curDate.year, curDate.month);
  const schoolDays = monthDays.filter(d => d.isSchoolDay);

  const filteredStudents = selectedVan === 'all'
    ? students
    : students.filter(s => s.vanNumber === selectedVan);

  // Update payment function (handles both external or internal)
  const setStudentPayment = (
    studentId: string,
    paymentUpdate: Partial<MonthlyPaymentRecord>
  ) => {
    if (externalUpdatePayment) {
      externalUpdatePayment(yearMonthKey, studentId, paymentUpdate);
    } else {
      setInternalPaymentStore(prev => {
        const updated = { ...prev };
        if (!updated[yearMonthKey]) updated[yearMonthKey] = {};
        const cur = updated[yearMonthKey][studentId] || {
          studentId,
          yearMonth: yearMonthKey,
          status: 'Unpaid'
        };
        updated[yearMonthKey][studentId] = {
          ...cur,
          ...paymentUpdate
        };
        saveMonthlyPayments(updated);
        return updated;
      });
    }
  };

  // Quick 1-click Pay/Unpay toggle
  const handleQuickTogglePay = (student: SriLankaStudent, currentStatus: 'Paid' | 'Unpaid') => {
    const studentRate = student.monthlyRate || 7500;
    if (currentStatus === 'Paid') {
      // Mark as Unpaid
      setStudentPayment(student.id, {
        status: 'Unpaid',
        paidAmount: undefined,
        paidDate: undefined,
        note: 'Marked unpaid'
      });
    } else {
      // Mark as Paid
      const todayIso = formatDateISO(new Date());
      setStudentPayment(student.id, {
        status: 'Paid',
        paidAmount: studentRate,
        paidDate: todayIso,
        method: 'Cash',
        note: 'Paid to driver'
      });
    }
  };

  // Save inline student rate
  const handleSaveStudentRate = (studentId: string) => {
    const num = Number(editingRateValue);
    if (num > 0) {
      if (onUpdateStudentRate) {
        onUpdateStudentRate(studentId, num);
      }
    }
    setEditingRateStudentId(null);
  };

  // Open detailed payment modal
  const openPaymentModal = (student: SriLankaStudent) => {
    const payRecord = activePaymentStore[yearMonthKey]?.[student.id];
    const rate = student.monthlyRate || 7500;
    setPaymentModalStudent(student);
    setModalPayStatus(payRecord?.status || 'Paid');
    setModalPayAmount(payRecord?.paidAmount || rate);
    setModalPayDate(payRecord?.paidDate || formatDateISO(new Date()));
    setModalPayMethod(payRecord?.method || 'Cash');
    setModalPayNote(payRecord?.note || '');
  };

  const handleSavePaymentModal = () => {
    if (!paymentModalStudent) return;
    setStudentPayment(paymentModalStudent.id, {
      status: modalPayStatus,
      paidAmount: modalPayStatus === 'Paid' ? modalPayAmount : undefined,
      paidDate: modalPayStatus === 'Paid' ? modalPayDate : undefined,
      method: modalPayMethod,
      note: modalPayNote
    });
    setPaymentModalStudent(null);
  };

  // Aggregated month stats with individual rate & payment status
  const summaries = filteredStudents.map(s =>
    calculateStudentMonthlySummary(
      s.id,
      curDate.year,
      curDate.month,
      history,
      s.monthlyRate,
      activePaymentStore
    )
  );

  // Financial Metrics
  const totalTargetRevenue = summaries.reduce((sum, s) => sum + s.monthlyFeeEstimated, 0);
  const paidSummaries = summaries.filter(s => s.paymentStatus === 'Paid');
  const unpaidSummaries = summaries.filter(s => s.paymentStatus === 'Unpaid');

  const totalCollectedRevenue = paidSummaries.reduce(
    (sum, s) => sum + (s.paidAmount || s.monthlyFeeEstimated),
    0
  );
  const totalPendingRevenue = unpaidSummaries.reduce(
    (sum, s) => sum + s.monthlyFeeEstimated,
    0
  );
  const collectionPercentage = totalTargetRevenue > 0
    ? Math.round((totalCollectedRevenue / totalTargetRevenue) * 100)
    : 0;

  // Attendance metrics
  const totalVanDaysSum = summaries.reduce((sum, s) => sum + s.vanDays, 0);
  const totalSchoolDaysSum = summaries.reduce((sum, s) => sum + s.schoolPresentDays, 0);
  const totalAbsencesSum = summaries.reduce((sum, s) => sum + s.absentDays, 0);
  const avgAttendance = Math.round(
    summaries.reduce((sum, s) => sum + s.attendanceRate, 0) / (summaries.length || 1)
  );

  // Filter list by payment status
  const displayStudents = filteredStudents.filter(s => {
    const summary = summaries.find(sm => sm.studentId === s.id);
    if (payFilter === 'paid') return summary?.paymentStatus === 'Paid';
    if (payFilter === 'unpaid') return summary?.paymentStatus === 'Unpaid';
    return true;
  });

  // Copy monthly report with fees and payment status
  const handleCopyMonthReport = () => {
    const curMonthName = monthNames[curDate.month - 1];
    const lines = [
      `📑 MONTHLY SCHOOL VAN REGISTER & FEE COLLECTION - ${curMonthName} ${curDate.year}`,
      `Van: ${selectedVan === 'all' ? 'All Vans' : selectedVan}`,
      `Total School Days: ${schoolDays.length} | Avg Attendance: ${avgAttendance}%`,
      `Fee Collection: Rs. ${totalCollectedRevenue.toLocaleString()} / Rs. ${totalTargetRevenue.toLocaleString()} (${collectionPercentage}% Collected)`,
      `Paid: ${paidSummaries.length} Students | Unpaid: ${unpaidSummaries.length} Students`,
      `------------------------------------------------------------------------------------------------`,
      `Name\tGrade\tStop\tVan\tDays\tAbs\tEst. Rate (LKR)\tPAY STATUS\tPaid Date\tMethod`
    ];

    summaries.forEach(s => {
      const student = students.find(st => st.id === s.studentId);
      if (!student) return;
      lines.push(
        `${student.name}\t${student.grade}\t${student.pickupLocation}\t${student.vanNumber.split(' ')[0]}\t${s.vanDays}/${schoolDays.length}\t${s.absentDays}\tRs. ${s.monthlyFeeEstimated.toLocaleString()}\t${s.paymentStatus.toUpperCase()}\t${s.paidDate || '-'}\t${s.paymentMethod || '-'}`
      );
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation & Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                {lang === 'si' ? 'මාසික පැමිණීම සහ වෑන් ගාස්තු සටහන' : 'Monthly Transit & Fee Ledger'}
              </h3>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                {lang === 'si' ? monthNamesSi[curDate.month - 1] : monthNames[curDate.month - 1]} {curDate.year}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'si'
                ? `එක් එක් ළමයාගේ මාසික ඇස්තමේන්තු ගාස්තුව සහ ගෙවීම් තත්ත්වය (Paid / Not Paid)`
                : `Individual monthly EST rates per child with 1-click Pay or Not status`}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
            title="පෙර මාසය"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'si' ? 'පෙර මාසය' : 'Prev'}</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black">
            {monthNames[curDate.month - 1]} {curDate.year}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
            title="මීළඟ මාසය"
          >
            <span className="hidden sm:inline">{lang === 'si' ? 'මීළඟ මාසය' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyMonthReport}
            className="px-3 py-1.5 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ml-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-700" />}
            <span>{copied ? (lang === 'si' ? 'පිටපත් විය!' : 'Copied!') : (lang === 'si' ? 'සාරාංශය පිටපත් කරන්න' : 'Copy Ledger')}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
            title="මුද්‍රණය කරන්න (Print)"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTHLY FEE & PAYMENT STATUS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Total Target Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'si' ? 'බලාපොරොත්තු මුළු ගාස්තු' : 'Est. Target Total'}
            </span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Rs. {totalTargetRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            {filteredStudents.length} {lang === 'si' ? 'ළමුන්ගේ එකතුව' : 'students on route'}
          </div>
        </div>

        {/* 2. Total Paid (Collected) */}
        <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'si' ? 'ගෙවා ඇත (PAID)' : 'Total Paid'}</span>
            </span>
            <span className="text-xs font-black bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
              {paidSummaries.length} / {summaries.length}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
            Rs. {totalCollectedRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <span>{lang === 'si' ? 'මුදල් ලැබී ඇති ළමුන් සංඛ්‍යාව' : 'Collected for current month'}</span>
          </div>
        </div>

        {/* 3. Total Unpaid (Pending) */}
        <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{lang === 'si' ? 'ගෙවීමට ඉතිරිව ඇත (UNPAID)' : 'Unpaid / Due'}</span>
            </span>
            <span className="text-xs font-black bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full">
              {unpaidSummaries.length} {lang === 'si' ? 'ළමුන්' : 'left'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
            Rs. {totalPendingRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-700 font-medium mt-1 flex items-center gap-1">
            <span>{lang === 'si' ? 'තවම ගෙවා නොමැති මුදල' : 'Outstanding pending payment'}</span>
          </div>
        </div>

        {/* 4. Collection Progress & Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {lang === 'si' ? 'පියවූ ප්‍රතිශතය' : 'Collection Rate'}
              </span>
              <span className="text-xs font-black text-indigo-700">{collectionPercentage}%</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-2 flex items-center justify-between">
            <span>{lang === 'si' ? 'සාමාන්‍ය පැමිණීම:' : 'Avg Attendance:'} <strong className="text-slate-800">{avgAttendance}%</strong></span>
            <span>{schoolDays.length} {lang === 'si' ? 'පාසල් දින' : 'school days'}</span>
          </div>
        </div>
      </div>

      {/* FILTER & INSTRUCTION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'si' ? 'පෙරහන:' : 'Filter:'}</span>
          </span>

          <button
            type="button"
            onClick={() => setPayFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
              payFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {lang === 'si' ? 'සියල්ල (All)' : 'All'} ({filteredStudents.length})
          </button>

          <button
            type="button"
            onClick={() => setPayFilter('paid')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
              payFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{lang === 'si' ? 'ගෙවා ඇති (Paid)' : 'Paid'} ({paidSummaries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPayFilter('unpaid')}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
              payFilter === 'unpaid'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{lang === 'si' ? 'ගෙවීමට ඇති (Unpaid)' : 'Unpaid'} ({unpaidSummaries.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>{lang === 'si' ? 'ක්ලික් කර ගෙවීම් තත්ත්වය (Paid / Not Paid) හා එක් එක් ළමයාගේ ගාස්තුව වෙනස් කරන්න' : '1-click toggle Paid/Unpaid & click ✏️ to customize individual rate'}</span>
        </div>
      </div>

      {/* Main Monthly Attendance & Fee Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 bg-slate-50/70">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'si' ? 'ශිෂ්‍ය මාසික වෑන් ගාස්තු හා ගෙවීම් ලේඛනය (Monthly Fee & Payment Register)' : 'Monthly Student Van Fee & Payment Register'}</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {lang === 'si'
                ? 'එක් එක් ළමයාගේ වෙනස් ගාස්තු (EST rate) සහ ගෙවා ඇත්ද නැද්ද (Pay or Not) මෙතැනින් පාලනය කරන්න.'
                : 'Manage different monthly EST rates per child and update Pay or Not status.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-slate-100/90 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3.5">{lang === 'si' ? 'ශිෂ්‍යයා (Student)' : 'Student'}</th>
                <th className="py-3 px-3">{lang === 'si' ? 'නැවතුම / වෑන්' : 'Stop / Van'}</th>
                <th className="py-3 px-3 text-center">{lang === 'si' ? 'වෑන් දින' : 'Van Days'}</th>
                <th className="py-3 px-3 text-center">{lang === 'si' ? 'පාසල් දින' : 'School'}</th>
                <th className="py-3 px-3 text-center">{lang === 'si' ? 'පැමිණීම' : 'Rate %'}</th>
                <th className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>{lang === 'si' ? 'මාසික ඇස්තමේන්තු ගාස්තුව (EST Rate)' : 'Monthly EST Rate'}</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">{lang === 'si' ? 'PAY OR NOT (ගෙවීම් තත්ත්වය)' : 'PAY OR NOT'}</th>
                <th className="py-3 px-3 text-center">{lang === 'si' ? 'ක්‍රියා / Action' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                    {lang === 'si' ? 'මෙම පෙරහනට අදාළ ළමුන් නැත.' : 'No students matching this filter.'}
                  </td>
                </tr>
              ) : (
                displayStudents.map(student => {
                  const summary = calculateStudentMonthlySummary(
                    student.id,
                    curDate.year,
                    curDate.month,
                    history,
                    student.monthlyRate,
                    activePaymentStore
                  );

                  const isPaid = summary.paymentStatus === 'Paid';
                  const isEditingThisRate = editingRateStudentId === student.id;

                  const assignedVan = vans.find(v => v.vanNumber === student.vanNumber) || vans[0];

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-indigo-50/25 transition-colors ${
                        isPaid ? 'bg-emerald-50/15' : 'bg-rose-50/10'
                      }`}
                    >
                      {/* 1. Student Name & Parent */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                            {student.grade}
                          </span>
                          <span>· {student.parentName.split('(')[0].trim()}</span>
                          <span className="font-mono text-slate-400">({student.parentPhone})</span>
                        </div>
                      </td>

                      {/* 2. Stop & Van */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-amber-900 text-[11px] truncate max-w-[140px]" title={student.pickupLocation}>
                          📍 {student.pickupLocation}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {student.vanNumber.split(' ')[0]}
                        </div>
                      </td>

                      {/* 3. Van Days */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-bold text-xs border border-amber-200">
                          {summary.vanDays} / {schoolDays.length}
                        </span>
                      </td>

                      {/* 4. School Days Present */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md font-bold text-xs border border-blue-200">
                          {summary.schoolPresentDays}
                        </span>
                      </td>

                      {/* 5. Attendance Rate */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                          summary.attendanceRate >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : summary.attendanceRate >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {summary.attendanceRate}%
                        </span>
                      </td>

                      {/* 6. INDIVIDUAL MONTHLY EST RATE (EDITABLE PER CHILD) */}
                      <td className="py-3 px-3 text-right">
                        {isEditingThisRate ? (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <span className="text-xs font-bold text-slate-500">Rs.</span>
                            <input
                              type="number"
                              step="100"
                              min="0"
                              value={editingRateValue}
                              onChange={e => setEditingRateValue(Number(e.target.value))}
                              className="w-20 px-1.5 py-0.5 text-xs font-black bg-white border-2 border-amber-500 rounded-md text-right focus:outline-none"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveStudentRate(student.id);
                                if (e.key === 'Escape') setEditingRateStudentId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveStudentRate(student.id)}
                              className="p-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md transition-colors"
                              title="සුරකින්න (Save)"
                            >
                              <Check className="w-3 h-3 font-bold" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRateStudentId(null)}
                              className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"
                              title="අවලංගුයි (Cancel)"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 justify-end group">
                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              Rs. {summary.monthlyFeeEstimated.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRateStudentId(student.id);
                                setEditingRateValue(summary.monthlyFeeEstimated);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-amber-800 hover:bg-amber-100 transition-colors opacity-80 group-hover:opacity-100"
                              title={lang === 'si' ? 'මෙම ළමයාගේ මාසික ගාස්තුව වෙනස් කරන්න (Change Rate)' : 'Change EST rate for this child'}
                            >
                              <Edit2 className="w-3 h-3 text-amber-600" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 7. PAY OR NOT TOGGLE BUTTON */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePay(student, summary.paymentStatus)}
                          className={`min-w-[130px] px-2.5 py-1.5 rounded-xl font-black text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer mx-auto ${
                            isPaid
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-1 ring-emerald-700'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 hover:border-rose-400'
                          }`}
                          title={
                            isPaid
                              ? (lang === 'si' ? 'ගෙවා ඇත. නොගෙවූ ලෙස වෙනස් කිරීමට ක්ලික් කරන්න.' : 'Paid. Click to mark unpaid.')
                              : (lang === 'si' ? 'තවම ගෙවා නැත. ගෙවූ බව සටහන් කිරීමට ක්ලික් කරන්න.' : 'Not Paid. Click to mark PAID!')
                          }
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                              <span>PAID (ගෙවා ඇත)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>NOT PAID (නොගෙවූ)</span>
                            </>
                          )}
                        </button>

                        {/* Paid date and method subtitle */}
                        {isPaid && summary.paidDate && (
                          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                            {summary.paidDate} {summary.paymentMethod ? `· ${summary.paymentMethod}` : ''}
                          </div>
                        )}
                        {!isPaid && (
                          <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                            {lang === 'si' ? 'ගෙවීමට ඉතිරිව ඇත' : 'Payment due'}
                          </div>
                        )}
                      </td>

                      {/* 8. ACTIONS: WHATSAPP REMINDER / RECEIPT & DETAILS */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          {!isPaid ? (
                            <a
                              href={generateFeeReminderWhatsAppLink(
                                student.parentPhone,
                                student.parentName,
                                student.name,
                                monthNames[curDate.month - 1],
                                summary.monthlyFeeEstimated,
                                student.vanNumber,
                                assignedVan.driverName,
                                lang
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                              title={lang === 'si' ? 'දෙමාපියන්ට ගාස්තු සිහිකැඳවීම් WhatsApp යවන්න' : 'Send WhatsApp fee reminder to parent'}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden xl:inline text-[10px]">{lang === 'si' ? 'සිහිකැඳවීම' : 'Remind'}</span>
                            </a>
                          ) : (
                            <a
                              href={generateFeeReceiptWhatsAppLink(
                                student.parentPhone,
                                student.parentName,
                                student.name,
                                monthNames[curDate.month - 1],
                                summary.paidAmount || summary.monthlyFeeEstimated,
                                summary.paidDate || formatDateISO(new Date()),
                                student.vanNumber,
                                assignedVan.driverName,
                                lang
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                              title={lang === 'si' ? 'දෙමාපියන්ට ගෙවීම් රිසිට්පත WhatsApp කරන්න' : 'Send WhatsApp payment receipt'}
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="hidden xl:inline text-[10px]">{lang === 'si' ? 'රිසිට්පත' : 'Receipt'}</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => openPaymentModal(student)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            title={lang === 'si' ? 'ගෙවීම් විස්තර සටහන් කරන්න (Edit Payment Details)' : 'Edit payment details & date'}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT DETAILS MODAL */}
      {paymentModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                  💰
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {lang === 'si' ? 'මාසික ගෙවීම් විස්තර' : 'Monthly Payment Details'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {paymentModalStudent.name} · {monthNames[curDate.month - 1]} {curDate.year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalStudent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Payment Status Toggle (PAID or NOT PAID) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {lang === 'si' ? 'ගෙවීම් තත්ත්වය (PAY OR NOT):' : 'Payment Status (PAY OR NOT):'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalPayStatus('Paid')}
                    className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      modalPayStatus === 'Paid'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PAID (ගෙවා ඇත)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalPayStatus('Unpaid')}
                    className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      modalPayStatus === 'Unpaid'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>NOT PAID (නොගෙවූ)</span>
                  </button>
                </div>
              </div>

              {/* Paid Amount */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'si' ? 'ගෙවූ / ගෙවිය යුතු මුදල (Amount in LKR):' : 'Amount (LKR):'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={modalPayAmount}
                    onChange={e => setModalPayAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 text-xs font-black bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Paid Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'si' ? 'ගෙවූ දිනය (Payment Date):' : 'Payment Date:'}
                </label>
                <input
                  type="date"
                  value={modalPayDate}
                  onChange={e => setModalPayDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'si' ? 'ගෙවීම් ක්‍රමය (Payment Method):' : 'Payment Method:'}
                </label>
                <select
                  value={modalPayMethod}
                  onChange={e => setModalPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900"
                >
                  <option value="Cash">💵 මුදලින් (Cash to Driver)</option>
                  <option value="Bank Transfer">🏦 බැංකු තැන්පතුව (Bank Transfer / Deposit)</option>
                  <option value="Other">📱 වෙනත් / Other</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'si' ? 'සටහන (Note / Reference):' : 'Note / Reference:'}
                </label>
                <input
                  type="text"
                  value={modalPayNote}
                  onChange={e => setModalPayNote(e.target.value)}
                  placeholder="e.g. Handed to Sunil Uncle / Slip on WhatsApp"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
              >
                {lang === 'si' ? 'අවලංගුයි (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSavePaymentModal}
                className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{lang === 'si' ? 'සුරකින්න (Save Payment)' : 'Save Payment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

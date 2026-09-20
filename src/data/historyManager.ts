import { SriLankaStudent, INITIAL_SRI_LANKA_STUDENTS } from './sriLankaData';

export interface DailyStudentRecord {
  studentId: string;
  dateStr?: string;
  morningStatus: 'InVan' | 'Absent' | 'WithParent' | 'Pending';
  morningTime?: string;
  schoolStatus: 'Present' | 'Absent' | 'Pending';
  eveningStatus: 'InVan' | 'ParentPickup' | 'DroppedHome' | 'Absent' | 'Pending';
  eveningTime?: string;
  note?: string;
}

export type HistoryStore = Record<string, Record<string, DailyStudentRecord>>;

export interface MonthlyPaymentRecord {
  studentId: string;
  yearMonth: string; // e.g. "2026-09"
  status: 'Paid' | 'Unpaid';
  paidAmount?: number;
  paidDate?: string; // e.g. "2026-09-05"
  method?: 'Cash' | 'Bank Transfer' | 'Other';
  note?: string;
}

export type MonthlyPaymentStore = Record<string, Record<string, MonthlyPaymentRecord>>;

export const STORAGE_HISTORY_KEY = 'sl_history_records_v3';
export const STORAGE_SELECTED_DATE_KEY = 'sl_selected_date_v2';
export const STORAGE_PAYMENTS_KEY = 'sl_monthly_payments_v2';

// Helper: Format Date to YYYY-MM-DD
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Default anchor date (Today)
export function getInitialDateString(): string {
  try {
    const saved = localStorage.getItem(STORAGE_SELECTED_DATE_KEY);
    if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) {
      return saved;
    }
  } catch {}
  
  // Use today's local date
  const now = new Date();
  // If in 2026 or current year
  return formatDateISO(now);
}

// Get the Monday of the given week
export function getMondayOfWeek(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7; // Distance from Monday
  d.setDate(d.getDate() - distanceToMonday);
  return d;
}

export interface WeekDayInfo {
  dateStr: string;
  dayNumber: number;
  dayName: string;
  dayNameSi: string;
  dayNameShort: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

// Get Monday to Friday days for a week
export function getWeekDays(referenceDateStr: string): WeekDayInfo[] {
  const monday = getMondayOfWeek(referenceDateStr);
  const todayStr = formatDateISO(new Date());
  
  const dayNamesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayNamesSi = ['සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා'];
  const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const days: WeekDayInfo[] = [];

  for (let i = 0; i < 5; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const dateStr = formatDateISO(cur);

    days.push({
      dateStr,
      dayNumber: cur.getDate(),
      dayName: dayNamesEn[i],
      dayNameSi: dayNamesSi[i],
      dayNameShort: shortNames[i],
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      isFuture: dateStr > todayStr
    });
  }

  return days;
}

export interface MonthDayInfo {
  dateStr: string;
  dayNumber: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  dayNameShort: string;
  isWeekend: boolean;
  isSchoolDay: boolean;
  isToday: boolean;
}

// Get all days of a month
export function getMonthDays(year: number, month: number): MonthDayInfo[] {
  // month is 1-indexed (1 = Jan, 9 = Sep)
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = formatDateISO(new Date());
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const list: MonthDayInfo[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSchoolDay = !isWeekend;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    list.push({
      dateStr,
      dayNumber: d,
      dayOfWeek,
      dayNameShort: shortDays[dayOfWeek],
      isWeekend,
      isSchoolDay,
      isToday: dateStr === todayStr
    });
  }

  return list;
}

// Generate realistic seeded history for current month so week and month views are rich immediately
export function createSeedHistory(students: SriLankaStudent[], todayDateStr: string): HistoryStore {
  const store: HistoryStore = {};
  const [curYear, curMonth] = todayDateStr.split('-').map(Number);

  // Populate all weekdays of current month up to today
  const daysInMonth = new Date(curYear, curMonth, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(curYear, curMonth - 1, d);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dateStr = `${curYear}-${String(curMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // If it's today, seed with current student state
    if (dateStr === todayDateStr) {
      store[dateStr] = {};
      students.forEach(s => {
        store[dateStr][s.id] = {
          studentId: s.id,
          morningStatus: s.morningStatus,
          morningTime: s.morningTime,
          schoolStatus: s.schoolStatus,
          eveningStatus: s.eveningStatus,
          eveningTime: s.eveningTime
        };
      });
      continue;
    }

    // Past weekdays: realistic distribution
    if (dateStr < todayDateStr) {
      store[dateStr] = {};
      students.forEach((s, idx) => {
        // Deterministic pseudo-random variation based on day + student index
        const pseudoVal = (d * 7 + idx * 13) % 100;

        let morningStatus: DailyStudentRecord['morningStatus'] = 'InVan';
        let morningTime: string | undefined = '06:45 AM';
        let schoolStatus: DailyStudentRecord['schoolStatus'] = 'Present';
        let eveningStatus: DailyStudentRecord['eveningStatus'] = 'DroppedHome';
        let eveningTime: string | undefined = '02:30 PM';

        if (pseudoVal < 6) {
          // Occasional absent
          morningStatus = 'Absent';
          morningTime = undefined;
          schoolStatus = 'Absent';
          eveningStatus = 'Absent';
          eveningTime = undefined;
        } else if (pseudoVal < 12) {
          // Parent transit
          morningStatus = 'WithParent';
          morningTime = '07:10 AM';
          schoolStatus = 'Present';
          eveningStatus = 'ParentPickup';
          eveningTime = '01:50 PM';
        } else {
          // Normal transit
          const minutes = 35 + ((idx * 8 + d) % 25);
          morningTime = `06:${String(minutes).padStart(2, '0')} AM`;
          eveningTime = `02:${String(15 + (idx * 5) % 30).padStart(2, '0')} PM`;
        }

        store[dateStr][s.id] = {
          studentId: s.id,
          morningStatus,
          morningTime,
          schoolStatus,
          eveningStatus,
          eveningTime
        };
      });
    }
  }

  return store;
}

// Load history store from local storage or create seed
export function loadHistoryStore(students: SriLankaStudent[] = INITIAL_SRI_LANKA_STUDENTS): HistoryStore {
  const todayStr = getInitialDateString();
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        // Ensure today exists
        if (!parsed[todayStr]) {
          parsed[todayStr] = {};
          students.forEach(s => {
            parsed[todayStr][s.id] = {
              studentId: s.id,
              morningStatus: s.morningStatus,
              morningTime: s.morningTime,
              schoolStatus: s.schoolStatus,
              eveningStatus: s.eveningStatus,
              eveningTime: s.eveningTime
            };
          });
          localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load history store:', err);
  }

  const seeded = createSeedHistory(students, todayStr);
  try {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

// Save history store to local storage
export function saveHistoryStore(store: HistoryStore): void {
  try {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save history store:', err);
  }
}

// Apply day's records onto a list of students
export function applyDayToStudents(
  baseStudents: SriLankaStudent[],
  dateStr: string,
  history: HistoryStore
): SriLankaStudent[] {
  const dayRecords = history[dateStr];
  if (!dayRecords) {
    // If no records exist for this date yet, default to Pending
    return baseStudents.map(s => ({
      ...s,
      morningStatus: 'Pending',
      morningTime: undefined,
      schoolStatus: 'Pending',
      eveningStatus: 'Pending',
      eveningTime: undefined
    }));
  }

  return baseStudents.map(s => {
    const record = dayRecords[s.id];
    if (!record) {
      return {
        ...s,
        morningStatus: 'Pending',
        morningTime: undefined,
        schoolStatus: 'Pending',
        eveningStatus: 'Pending',
        eveningTime: undefined
      };
    }
    return {
      ...s,
      morningStatus: record.morningStatus,
      morningTime: record.morningTime,
      schoolStatus: record.schoolStatus,
      eveningStatus: record.eveningStatus,
      eveningTime: record.eveningTime
    };
  });
}

// Calculate weekly statistics for a student
export interface StudentWeeklySummary {
  studentId: string;
  totalDays: number;
  vanBoardedDays: number;
  schoolPresentDays: number;
  absentDays: number;
  parentTransitDays: number;
  attendanceRate: number; // percentage
}

export function calculateStudentWeeklySummary(
  studentId: string,
  weekDays: WeekDayInfo[],
  history: HistoryStore
): StudentWeeklySummary {
  let vanBoardedDays = 0;
  let schoolPresentDays = 0;
  let absentDays = 0;
  let parentTransitDays = 0;
  let recordedDays = 0;

  weekDays.forEach(day => {
    const rec = history[day.dateStr]?.[studentId];
    if (rec && rec.morningStatus !== 'Pending') {
      recordedDays++;
      if (rec.morningStatus === 'InVan') vanBoardedDays++;
      if (rec.morningStatus === 'WithParent') parentTransitDays++;
      if (rec.morningStatus === 'Absent') absentDays++;
      if (rec.schoolStatus === 'Present') schoolPresentDays++;
    }
  });

  const total = Math.max(recordedDays, 1);
  const attendanceRate = Math.round((schoolPresentDays / total) * 100);

  return {
    studentId,
    totalDays: recordedDays,
    vanBoardedDays,
    schoolPresentDays,
    absentDays,
    parentTransitDays,
    attendanceRate
  };
}

// Calculate monthly statistics for a student
export interface StudentMonthlySummary {
  studentId: string;
  monthName: string;
  totalSchoolDays: number;
  recordedDays: number;
  vanDays: number;
  schoolPresentDays: number;
  absentDays: number;
  parentTransitDays: number;
  attendanceRate: number;
  monthlyFeeEstimated: number; // Student's individual estimated van fee in LKR
  paymentStatus: 'Paid' | 'Unpaid';
  paidAmount?: number;
  paidDate?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Other';
  paymentNote?: string;
}

export function createSeedMonthlyPayments(
  students: SriLankaStudent[] = INITIAL_SRI_LANKA_STUDENTS,
  yearMonth: string = '2026-09'
): MonthlyPaymentStore {
  const store: MonthlyPaymentStore = {};
  store[yearMonth] = {};

  students.forEach((s, idx) => {
    const rate = s.monthlyRate || 7500;
    // Set 4 students as paid, 2 as unpaid
    if (idx === 0) {
      store[yearMonth][s.id] = {
        studentId: s.id,
        yearMonth,
        status: 'Paid',
        paidAmount: rate,
        paidDate: `${yearMonth}-05`,
        method: 'Cash',
        note: 'Cash handed to Sunil Uncle'
      };
    } else if (idx === 1) {
      store[yearMonth][s.id] = {
        studentId: s.id,
        yearMonth,
        status: 'Paid',
        paidAmount: rate,
        paidDate: `${yearMonth}-07`,
        method: 'Bank Transfer',
        note: 'Commercial Bank transfer slip on WhatsApp'
      };
    } else if (idx === 2) {
      store[yearMonth][s.id] = {
        studentId: s.id,
        yearMonth,
        status: 'Paid',
        paidAmount: rate,
        paidDate: `${yearMonth}-08`,
        method: 'Cash',
        note: 'Handed at morning pickup'
      };
    } else if (idx === 5) {
      store[yearMonth][s.id] = {
        studentId: s.id,
        yearMonth,
        status: 'Paid',
        paidAmount: rate,
        paidDate: `${yearMonth}-04`,
        method: 'Bank Transfer',
        note: 'BOC bank transfer'
      };
    } else {
      // Unpaid
      store[yearMonth][s.id] = {
        studentId: s.id,
        yearMonth,
        status: 'Unpaid',
        paidAmount: undefined,
        note: 'Payment pending'
      };
    }
  });

  return store;
}

export function loadMonthlyPayments(
  students: SriLankaStudent[] = INITIAL_SRI_LANKA_STUDENTS
): MonthlyPaymentStore {
  const curYm = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load monthly payments:', err);
  }

  const seeded = createSeedMonthlyPayments(students, curYm);
  // Also seed 2026-09 if curYm is different
  if (curYm !== '2026-09') {
    const fallback = createSeedMonthlyPayments(students, '2026-09');
    Object.assign(seeded, fallback);
  }
  try {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

export function saveMonthlyPayments(store: MonthlyPaymentStore): void {
  try {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save monthly payments:', err);
  }
}

export function calculateStudentMonthlySummary(
  studentId: string,
  year: number,
  month: number,
  history: HistoryStore,
  studentRate?: number,
  paymentStore?: MonthlyPaymentStore
): StudentMonthlySummary {
  const monthDays = getMonthDays(year, month).filter(d => d.isSchoolDay);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let recordedDays = 0;
  let vanDays = 0;
  let schoolPresentDays = 0;
  let absentDays = 0;
  let parentTransitDays = 0;

  monthDays.forEach(d => {
    const rec = history[d.dateStr]?.[studentId];
    if (rec && rec.morningStatus !== 'Pending') {
      recordedDays++;
      if (rec.morningStatus === 'InVan') vanDays++;
      if (rec.morningStatus === 'WithParent') parentTransitDays++;
      if (rec.morningStatus === 'Absent') absentDays++;
      if (rec.schoolStatus === 'Present') schoolPresentDays++;
    }
  });

  const divisor = recordedDays > 0 ? recordedDays : 1;
  const attendanceRate = Math.round((schoolPresentDays / divisor) * 100);

  // Each student's individual rate (customized per child) or default 7500
  const rate = typeof studentRate === 'number' && studentRate > 0 ? studentRate : 7500;

  // Check payment store
  const ymKey = `${year}-${String(month).padStart(2, '0')}`;
  const payRecord = paymentStore?.[ymKey]?.[studentId];
  const paymentStatus = payRecord?.status || 'Unpaid';

  return {
    studentId,
    monthName: monthNames[month - 1] || 'Month',
    totalSchoolDays: monthDays.length,
    recordedDays,
    vanDays,
    schoolPresentDays,
    absentDays,
    parentTransitDays,
    attendanceRate,
    monthlyFeeEstimated: rate,
    paymentStatus,
    paidAmount: payRecord?.paidAmount,
    paidDate: payRecord?.paidDate,
    paymentMethod: payRecord?.method,
    paymentNote: payRecord?.note
  };
}

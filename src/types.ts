export type MorningBusStatus = 'Boarded' | 'Absent' | 'Parent Transit' | 'Walk' | 'Pending';
export type SchoolPresenceStatus = 'Present' | 'Absent' | 'Tardy' | 'Excused' | 'Pending';
export type EveningBusStatus = 'Boarded Bus' | 'Parent Pickup' | 'After-School Activity' | 'Walker' | 'Absent' | 'Pending';

export type UnifiedSafetyStatus = 
  | 'Safe In Transit / Present'
  | 'Safe Home Drop-Off'
  | 'CRITICAL: Boarded Bus but Missing at School'
  | 'Transit Discrepancy: Skipped Bus but Present'
  | 'PM Attention: Present but Unaccounted for PM'
  | 'Full Absence Excused'
  | 'Pending Morning Confirmation';

export interface StudentTransitRecord {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  homeroom: string;
  routeNumber: string;
  routeName: string;
  busStop: string;
  guardianName: string;
  guardianPhone: string;
  // Morning Bus
  morningBusStatus: MorningBusStatus;
  morningPickupTime?: string;
  morningAideNotes?: string;
  // School Presence
  schoolStatus: SchoolPresenceStatus;
  schoolCheckTime?: string;
  // Evening Bus
  eveningBusStatus: EveningBusStatus;
  eveningDropTime?: string;
  eveningNotes?: string;
  // Derived
  unifiedStatus: UnifiedSafetyStatus;
  specialNotes?: string;
}

export interface RouteInfo {
  routeNumber: string;
  routeName: string;
  driverName: string;
  busCapacity: number;
  contactNumber: string;
}

export interface SchemaColumn {
  colIndex: string;
  header: string;
  type: 'Text' | 'Date' | 'Time' | 'Dropdown' | 'Formula' | 'Phone';
  validationOptions?: string[];
  formula?: string;
  description: string;
  example: string;
  required: boolean;
}

export interface FormulaTemplate {
  id: string;
  name: string;
  category: 'Safety Reconciliation' | 'Route Capacity' | 'Discrepancy Reporting' | 'Conditional Formatting';
  description: string;
  formula: string;
  breakdown: {
    part: string;
    explanation: string;
  }[];
  notes?: string;
}

import { SchemaColumn } from '../types';

export const TEMPLATE_COLUMNS: SchemaColumn[] = [
  {
    colIndex: 'A',
    header: 'Date',
    type: 'Date',
    description: 'Attendance date for the session. Default to today or pre-filled by daily script.',
    example: '2026-09-18',
    required: true
  },
  {
    colIndex: 'B',
    header: 'Student_ID',
    type: 'Text',
    description: 'Unique school district registration ID for student lookup and barcode scan.',
    example: 'ST-1042',
    required: true
  },
  {
    colIndex: 'C',
    header: 'Student_Name',
    type: 'Text',
    description: 'Full legal name (Last, First or First Last) matching school SIS roster.',
    example: 'Emma Watson-Lee',
    required: true
  },
  {
    colIndex: 'D',
    header: 'Grade_Homeroom',
    type: 'Text',
    description: 'Grade level and assigned homeroom teacher or classroom room number.',
    example: '4th Grade (Rm 204)',
    required: true
  },
  {
    colIndex: 'E',
    header: 'Route_Number',
    type: 'Dropdown',
    validationOptions: ['Route 101', 'Route 204', 'Route 308', 'Route 412'],
    description: 'Designated school bus route ID or transit number.',
    example: 'Route 101',
    required: true
  },
  {
    colIndex: 'F',
    header: 'Bus_Stop_Location',
    type: 'Text',
    description: 'Scheduled morning pickup and evening drop-off curb intersection or stop code.',
    example: 'Maple Ave & 4th St',
    required: true
  },
  {
    colIndex: 'G',
    header: 'Morning_Bus_Status',
    type: 'Dropdown',
    validationOptions: ['Boarded', 'Absent', 'Parent Transit', 'Walk', 'Pending'],
    description: 'Bus driver or aide morning check-in status logged at the bus door.',
    example: 'Boarded',
    required: true
  },
  {
    colIndex: 'H',
    header: 'AM_Pickup_Time',
    type: 'Time',
    description: 'Timestamp when student physically stepped onto the bus (manual or Apps Script onEdit).',
    example: '07:18 AM',
    required: false
  },
  {
    colIndex: 'I',
    header: 'School_Presence_Status',
    type: 'Dropdown',
    validationOptions: ['Present', 'Absent', 'Tardy', 'Excused', 'Pending'],
    description: 'Homeroom teacher or main entrance turnstile morning attendance record.',
    example: 'Present',
    required: true
  },
  {
    colIndex: 'J',
    header: 'School_Check_Time',
    type: 'Time',
    description: 'Time student was recorded at homeroom bell or entrance turnstile.',
    example: '08:05 AM',
    required: false
  },
  {
    colIndex: 'K',
    header: 'Evening_Bus_Status',
    type: 'Dropdown',
    validationOptions: ['Boarded Bus', 'Parent Pickup', 'After-School Activity', 'Walker', 'Absent', 'Pending'],
    description: 'Dismissal departure mode recorded at the afternoon bus departure bay.',
    example: 'Boarded Bus',
    required: true
  },
  {
    colIndex: 'L',
    header: 'PM_Drop_Time',
    type: 'Time',
    description: 'Timestamp when student safely disembarked at neighborhood stop or parent handoff.',
    example: '03:45 PM',
    required: false
  },
  {
    colIndex: 'M',
    header: 'Unified_Safety_Status',
    type: 'Formula',
    formula: '=IFS(AND(G2="Boarded", I2="Absent"), "🚨 CRITICAL: Boarded Bus but Missing at School", AND(OR(G2="Absent",G2="Parent Transit"), OR(I2="Present",I2="Tardy")), "⚠️ Transit Discrepancy: Skipped Bus but Present", AND(OR(I2="Present",I2="Tardy"), K2="Absent"), "⚠️ PM Attention: Present but Unaccounted for PM", AND(K2="Boarded Bus", L2<>""), "🟢 Safe Home Drop-Off", AND(OR(G2="Boarded",G2="Parent Transit"), OR(I2="Present",I2="Tardy")), "🟢 Safe In Transit / Present", AND(OR(G2="Absent",G2="Pending"), OR(I2="Absent",I2="Excused")), "⚪ Full Absence Excused", TRUE, "🟡 Pending Confirmation")',
    description: 'Auto-computed formula cross-referencing bus boarding with school presence.',
    example: '🟢 Safe In Transit / Present',
    required: true
  },
  {
    colIndex: 'N',
    header: 'Guardian_Emergency_Phone',
    type: 'Phone',
    description: 'Direct SMS/voice phone number for immediate discrepancy verification.',
    example: '(555) 301-8892',
    required: true
  },
  {
    colIndex: 'O',
    header: 'Transit_Notes',
    type: 'Text',
    description: 'Medical alerts, seating accommodations, authorized pickup notes, or aide remarks.',
    example: 'Authorized pickup: Grandma Mrs. Watson',
    required: false
  }
];

export const SHEET_TABS_SPECIFICATION = [
  {
    tabName: 'Daily_Transit_Attendance',
    purpose: 'Core single-record table tracking every student for the active day across bus and classroom touchpoints.',
    keyColumns: 'Date, Student_ID, Name, Route, AM_Status, School_Status, PM_Status, Unified_Status'
  },
  {
    tabName: 'Student_Roster_Master',
    purpose: 'Persistent master directory storing student IDs, default routes, bus stop addresses, and parent emergency numbers (used for VLOOKUP / XLOOKUP).',
    keyColumns: 'Student_ID, First_Name, Last_Name, Grade, Default_AM_Route, Default_PM_Route, Bus_Stop, Guardian_Phone'
  },
  {
    tabName: 'Daily_Safety_Dashboard',
    purpose: 'Real-time aggregation tab showing bus headcounts, boarding percentages, and a live alert table of all critical safety discrepancies.',
    keyColumns: 'Route_Summary, Total_Assigned, AM_Boarded, In_School_Present, PM_Boarded, Critical_Alert_Count'
  },
  {
    tabName: 'Attendance_History_Archive',
    purpose: 'Append-only historical audit log populated automatically at midnight by Google Apps Script for compliance and state attendance reporting.',
    keyColumns: 'All columns from Daily_Transit_Attendance + Timestamped_Archive_Date'
  }
];

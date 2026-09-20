import { StudentTransitRecord, RouteInfo, MorningBusStatus, SchoolPresenceStatus, EveningBusStatus, UnifiedSafetyStatus } from '../types';

export const INITIAL_ROUTES: RouteInfo[] = [
  { routeNumber: 'Route 101', routeName: 'North Shore Express', driverName: 'Marcus Vance', busCapacity: 48, contactNumber: '(555) 234-8901' },
  { routeNumber: 'Route 204', routeName: 'Pine Crest & Hilltop', driverName: 'Sarah Jenkins', busCapacity: 42, contactNumber: '(555) 345-6712' },
  { routeNumber: 'Route 308', routeName: 'East Valley Meadows', driverName: 'David Chen', busCapacity: 45, contactNumber: '(555) 456-7823' },
  { routeNumber: 'Route 412', routeName: 'Oakwood Suburban', driverName: 'Elena Rostova', busCapacity: 40, contactNumber: '(555) 567-8934' }
];

export function computeUnifiedStatus(
  morningBus: MorningBusStatus,
  school: SchoolPresenceStatus,
  eveningBus: EveningBusStatus,
  eveningDropTime?: string
): UnifiedSafetyStatus {
  // CRITICAL DISCREPANCY: Student boarded bus in morning, but absent at school!
  if (morningBus === 'Boarded' && (school === 'Absent')) {
    return 'CRITICAL: Boarded Bus but Missing at School';
  }

  // Skipped bus in morning, but attended school (e.g. parent carpool or walk)
  if ((morningBus === 'Absent' || morningBus === 'Parent Transit' || morningBus === 'Walk') && (school === 'Present' || school === 'Tardy')) {
    return 'Transit Discrepancy: Skipped Bus but Present';
  }

  // Student was in school, but is unaccounted for during evening departure
  if ((school === 'Present' || school === 'Tardy') && eveningBus === 'Absent') {
    return 'PM Attention: Present but Unaccounted for PM';
  }

  // Safe PM completion
  if (eveningBus === 'Boarded Bus' && eveningDropTime) {
    return 'Safe Home Drop-Off';
  }

  // Normal safe day so far
  if ((morningBus === 'Boarded' || morningBus === 'Parent Transit' || morningBus === 'Walk') && (school === 'Present' || school === 'Tardy')) {
    return 'Safe In Transit / Present';
  }

  // Full day absence
  if ((morningBus === 'Absent' || morningBus === 'Pending') && (school === 'Absent' || school === 'Excused')) {
    return 'Full Absence Excused';
  }

  return 'Pending Morning Confirmation';
}

export const INITIAL_STUDENTS: StudentTransitRecord[] = [
  {
    id: 'rec-1',
    studentId: 'ST-1042',
    name: 'Emma Watson-Lee',
    grade: '4th Grade',
    homeroom: 'Room 204 (Mrs. Gable)',
    routeNumber: 'Route 101',
    routeName: 'North Shore Express',
    busStop: 'Maple Ave & 4th St',
    guardianName: 'Claire Lee',
    guardianPhone: '(555) 301-8892',
    morningBusStatus: 'Boarded',
    morningPickupTime: '07:18 AM',
    morningAideNotes: 'Seated row 3 right',
    schoolStatus: 'Present',
    schoolCheckTime: '08:05 AM',
    eveningBusStatus: 'Pending',
    unifiedStatus: 'Safe In Transit / Present'
  },
  {
    id: 'rec-2',
    studentId: 'ST-1055',
    name: 'Lucas Thorne',
    grade: '5th Grade',
    homeroom: 'Room 312 (Mr. Harris)',
    routeNumber: 'Route 101',
    routeName: 'North Shore Express',
    busStop: 'Highland Blvd #140',
    guardianName: 'Derek Thorne',
    guardianPhone: '(555) 301-4419',
    morningBusStatus: 'Boarded',
    morningPickupTime: '07:25 AM',
    morningAideNotes: 'Boarded with blue backpack',
    schoolStatus: 'Absent', // CRITICAL ALERT CASE
    schoolCheckTime: '08:30 AM',
    eveningBusStatus: 'Pending',
    unifiedStatus: 'CRITICAL: Boarded Bus but Missing at School',
    specialNotes: 'Urgent check: Aide marked boarded at 7:25 AM, homeroom marked absent'
  },
  {
    id: 'rec-3',
    studentId: 'ST-1068',
    name: 'Aria Patel',
    grade: '3rd Grade',
    homeroom: 'Room 108 (Ms. Diaz)',
    routeNumber: 'Route 204',
    routeName: 'Pine Crest & Hilltop',
    busStop: 'Cedar Run Court',
    guardianName: 'Raj Patel',
    guardianPhone: '(555) 412-9903',
    morningBusStatus: 'Parent Transit',
    morningPickupTime: '',
    morningAideNotes: 'Parent called: Dropping off directly for dentist',
    schoolStatus: 'Tardy',
    schoolCheckTime: '09:15 AM',
    eveningBusStatus: 'Boarded Bus',
    eveningDropTime: '03:45 PM',
    eveningNotes: 'Released to mother at stop',
    unifiedStatus: 'Safe Home Drop-Off'
  },
  {
    id: 'rec-4',
    studentId: 'ST-1077',
    name: 'Noah Gallagher',
    grade: '6th Grade',
    homeroom: 'Room 401 (Dr. Evans)',
    routeNumber: 'Route 308',
    routeName: 'East Valley Meadows',
    busStop: 'Greenbrier Lane Stop 2',
    guardianName: 'Sarah Gallagher',
    guardianPhone: '(555) 554-1288',
    morningBusStatus: 'Boarded',
    morningPickupTime: '07:32 AM',
    schoolStatus: 'Present',
    schoolCheckTime: '08:02 AM',
    eveningBusStatus: 'Parent Pickup',
    eveningNotes: 'Mother picked up at front gate for swim practice',
    unifiedStatus: 'Safe In Transit / Present'
  },
  {
    id: 'rec-5',
    studentId: 'ST-1090',
    name: 'Maya Lin-Kim',
    grade: '4th Grade',
    homeroom: 'Room 204 (Mrs. Gable)',
    routeNumber: 'Route 204',
    routeName: 'Pine Crest & Hilltop',
    busStop: 'Sunset Ridge #42',
    guardianName: 'Hannah Kim',
    guardianPhone: '(555) 412-6521',
    morningBusStatus: 'Absent',
    morningPickupTime: '',
    schoolStatus: 'Excused',
    schoolCheckTime: '08:00 AM',
    eveningBusStatus: 'Absent',
    unifiedStatus: 'Full Absence Excused',
    specialNotes: 'Pre-reported family medical appointment'
  },
  {
    id: 'rec-6',
    studentId: 'ST-1102',
    name: 'Julian Reyes',
    grade: '5th Grade',
    homeroom: 'Room 312 (Mr. Harris)',
    routeNumber: 'Route 308',
    routeName: 'East Valley Meadows',
    busStop: 'Meadowview Way #8',
    guardianName: 'Carlos Reyes',
    guardianPhone: '(555) 554-9910',
    morningBusStatus: 'Boarded',
    morningPickupTime: '07:40 AM',
    schoolStatus: 'Present',
    schoolCheckTime: '08:10 AM',
    eveningBusStatus: 'After-School Activity',
    eveningNotes: 'STEM Robotics Club until 4:45 PM',
    unifiedStatus: 'Safe In Transit / Present'
  },
  {
    id: 'rec-7',
    studentId: 'ST-1115',
    name: 'Chloe Bennett',
    grade: '3rd Grade',
    homeroom: 'Room 108 (Ms. Diaz)',
    routeNumber: 'Route 412',
    routeName: 'Oakwood Suburban',
    busStop: 'Oakcrest Dr & 12th',
    guardianName: 'Mark Bennett',
    guardianPhone: '(555) 678-3312',
    morningBusStatus: 'Boarded',
    morningPickupTime: '07:15 AM',
    schoolStatus: 'Present',
    schoolCheckTime: '08:00 AM',
    eveningBusStatus: 'Absent', // Alert: Present in school, but missing from PM bus manifest!
    eveningNotes: 'Not at bus boarding queue',
    unifiedStatus: 'PM Attention: Present but Unaccounted for PM',
    specialNotes: 'Staff checking front lobby for parent pickup delay'
  },
  {
    id: 'rec-8',
    studentId: 'ST-1128',
    name: 'Ethan O\'Connor',
    grade: '6th Grade',
    homeroom: 'Room 401 (Dr. Evans)',
    routeNumber: 'Route 101',
    routeName: 'North Shore Express',
    busStop: 'Bayside Blvd #90',
    guardianName: 'Patricia O\'Connor',
    guardianPhone: '(555) 301-7729',
    morningBusStatus: 'Boarded',
    morningPickupTime: '07:22 AM',
    schoolStatus: 'Present',
    schoolCheckTime: '08:06 AM',
    eveningBusStatus: 'Boarded Bus',
    eveningDropTime: '03:52 PM',
    unifiedStatus: 'Safe Home Drop-Off'
  }
];

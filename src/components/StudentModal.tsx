import React, { useState } from 'react';
import { StudentTransitRecord, RouteInfo, MorningBusStatus, SchoolPresenceStatus, EveningBusStatus } from '../types';
import { computeUnifiedStatus } from '../data/initialData';
import { 
  X, 
  Bus, 
  School, 
  Home, 
  ShieldAlert, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Save, 
  Trash2,
  MapPin,
  AlertTriangle,
  User
} from 'lucide-react';

interface StudentModalProps {
  record: StudentTransitRecord | null;
  routes: RouteInfo[];
  onClose: () => void;
  onSave: (updated: StudentTransitRecord) => void;
  onDelete?: (id: string) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  record,
  routes,
  onClose,
  onSave,
  onDelete
}) => {
  if (!record) return null;

  const [name, setName] = useState(record.name);
  const [studentId, setStudentId] = useState(record.studentId);
  const [grade, setGrade] = useState(record.grade);
  const [homeroom, setHomeroom] = useState(record.homeroom);
  const [routeNumber, setRouteNumber] = useState(record.routeNumber);
  const [busStop, setBusStop] = useState(record.busStop);
  const [guardianName, setGuardianName] = useState(record.guardianName);
  const [guardianPhone, setGuardianPhone] = useState(record.guardianPhone);

  const [morningStatus, setMorningStatus] = useState<MorningBusStatus>(record.morningBusStatus);
  const [morningTime, setMorningTime] = useState(record.morningPickupTime || '');
  const [morningNotes, setMorningNotes] = useState(record.morningAideNotes || '');

  const [schoolStatus, setSchoolStatus] = useState<SchoolPresenceStatus>(record.schoolStatus);
  const [schoolTime, setSchoolTime] = useState(record.schoolCheckTime || '');

  const [eveningStatus, setEveningStatus] = useState<EveningBusStatus>(record.eveningBusStatus);
  const [eveningTime, setEveningTime] = useState(record.eveningDropTime || '');
  const [eveningNotes, setEveningNotes] = useState(record.eveningNotes || '');

  const [specialNotes, setSpecialNotes] = useState(record.specialNotes || '');

  const previewUnified = computeUnifiedStatus(morningStatus, schoolStatus, eveningStatus, eveningTime);
  const isCritical = previewUnified === 'CRITICAL: Boarded Bus but Missing at School';

  const handleSave = () => {
    const selectedRouteObj = routes.find(r => r.routeNumber === routeNumber);
    const updated: StudentTransitRecord = {
      ...record,
      name,
      studentId,
      grade,
      homeroom,
      routeNumber,
      routeName: selectedRouteObj ? selectedRouteObj.routeName : record.routeName,
      busStop,
      guardianName,
      guardianPhone,
      morningBusStatus: morningStatus,
      morningPickupTime: morningTime,
      morningAideNotes: morningNotes,
      schoolStatus,
      schoolCheckTime: schoolTime,
      eveningBusStatus: eveningStatus,
      eveningDropTime: eveningTime,
      eveningNotes,
      unifiedStatus: previewUnified,
      specialNotes
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isCritical ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl text-white ${
              isCritical ? 'bg-red-600' : 'bg-slate-900'
            }`}>
              {isCritical ? <ShieldAlert className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>{record.name}</span>
                <span className="font-mono text-xs px-1.5 py-0.5 bg-white text-slate-700 rounded border border-slate-200 font-semibold">
                  {record.studentId}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {record.grade} · {record.routeNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Live Status Result Card */}
          <div className={`p-4 rounded-xl border ${
            isCritical
              ? 'bg-red-100/70 border-red-300 text-red-950'
              : previewUnified.includes('Discrepancy') || previewUnified.includes('Attention')
              ? 'bg-amber-100/70 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-600">
              Live Auto-Reconciled Unified Status:
            </span>
            <div className="flex items-center gap-2 mt-1 text-sm font-bold">
              {isCritical ? (
                <ShieldAlert className="w-4 h-4 text-red-600" />
              ) : previewUnified.includes('Discrepancy') ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>{previewUnified}</span>
            </div>
            {isCritical && (
              <p className="text-xs text-red-800 mt-1 font-medium">
                🚨 Emergency Protocol: Bus aide marked child boarded at {morningTime || 'morning stop'}, but student is marked absent at school.
              </p>
            )}
          </div>

          {/* Touchpoints Section: Bus AM, School, Bus PM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Morning Bus Touchpoint */}
            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <Bus className="w-4 h-4 text-amber-600" />
                <span>Morning Bus Transit</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Status</label>
                <select
                  value={morningStatus}
                  onChange={e => setMorningStatus(e.target.value as MorningBusStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-medium"
                >
                  <option value="Boarded">Boarded</option>
                  <option value="Absent">Absent / Skipped</option>
                  <option value="Parent Transit">Parent Transit</option>
                  <option value="Walk">Walk</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pickup Time</label>
                <input
                  type="text"
                  value={morningTime}
                  onChange={e => setMorningTime(e.target.value)}
                  placeholder="e.g. 07:18 AM"
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Bus Aide Note</label>
                <input
                  type="text"
                  value={morningNotes}
                  onChange={e => setMorningNotes(e.target.value)}
                  placeholder="Seat notes, luggage..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>
            </div>

            {/* School Presence Touchpoint */}
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                <School className="w-4 h-4 text-blue-600" />
                <span>Classroom Presence</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">School Status</label>
                <select
                  value={schoolStatus}
                  onChange={e => setSchoolStatus(e.target.value as SchoolPresenceStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-medium"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Tardy">Tardy</option>
                  <option value="Excused">Excused</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Check-in Time</label>
                <input
                  type="text"
                  value={schoolTime}
                  onChange={e => setSchoolTime(e.target.value)}
                  placeholder="e.g. 08:05 AM"
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Homeroom</label>
                <input
                  type="text"
                  value={homeroom}
                  onChange={e => setHomeroom(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>
            </div>

            {/* Evening Bus Dismissal Touchpoint */}
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Evening Dismissal</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Departure Mode</label>
                <select
                  value={eveningStatus}
                  onChange={e => setEveningStatus(e.target.value as EveningBusStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-medium"
                >
                  <option value="Boarded Bus">Boarded Bus</option>
                  <option value="Parent Pickup">Parent Pickup</option>
                  <option value="After-School Activity">After-School Activity</option>
                  <option value="Walker">Walker</option>
                  <option value="Absent">Absent</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Drop Timestamp</label>
                <input
                  type="text"
                  value={eveningTime}
                  onChange={e => setEveningTime(e.target.value)}
                  placeholder="e.g. 03:45 PM"
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Handoff Notes</label>
                <input
                  type="text"
                  value={eveningNotes}
                  onChange={e => setEveningNotes(e.target.value)}
                  placeholder="Parent handoff notes..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Student Profile & Emergency Contacts */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Student Master Info & Emergency Contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Student Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Assigned Route</label>
                <select
                  value={routeNumber}
                  onChange={e => setRouteNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-medium"
                >
                  {routes.map(r => (
                    <option key={r.routeNumber} value={r.routeNumber}>
                      {r.routeNumber} - {r.routeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Bus Stop Location</label>
                <input
                  type="text"
                  value={busStop}
                  onChange={e => setBusStop(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Guardian Emergency Contact</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                    placeholder="Name"
                    className="w-1/2 bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={e => setGuardianPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-1/2 bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">Special Medical / Transit Accommodation Alert</label>
              <input
                type="text"
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                placeholder="Allergies, authorized pickup guardians, assistive needs..."
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove ${record.name} from active transit roster?`)) {
                    onDelete(record.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Student</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

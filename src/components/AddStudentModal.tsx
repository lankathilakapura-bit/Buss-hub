import React, { useState } from 'react';
import { StudentTransitRecord, RouteInfo, MorningBusStatus, SchoolPresenceStatus, EveningBusStatus } from '../types';
import { computeUnifiedStatus } from '../data/initialData';
import { X, UserPlus, Bus } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  routes: RouteInfo[];
  onClose: () => void;
  onAdd: (newRecord: StudentTransitRecord) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  routes,
  onClose,
  onAdd
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState(`ST-${Math.floor(1000 + Math.random() * 9000)}`);
  const [grade, setGrade] = useState('4th Grade');
  const [homeroom, setHomeroom] = useState('Room 204');
  const [routeNumber, setRouteNumber] = useState(routes[0]?.routeNumber || 'Route 101');
  const [busStop, setBusStop] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [morningStatus, setMorningStatus] = useState<MorningBusStatus>('Pending');
  const [schoolStatus, setSchoolStatus] = useState<SchoolPresenceStatus>('Pending');
  const [eveningStatus, setEveningStatus] = useState<EveningBusStatus>('Pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter student name.');
      return;
    }

    const selectedRoute = routes.find(r => r.routeNumber === routeNumber);
    const unified = computeUnifiedStatus(morningStatus, schoolStatus, eveningStatus);

    const newRecord: StudentTransitRecord = {
      id: 'rec-' + Date.now(),
      studentId: studentId.trim() || `ST-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      grade: grade.trim() || 'General',
      homeroom: homeroom.trim() || 'Main',
      routeNumber,
      routeName: selectedRoute?.routeName || 'Transit Express',
      busStop: busStop.trim() || 'Main Bus Loop',
      guardianName: guardianName.trim() || 'Emergency Contact',
      guardianPhone: guardianPhone.trim() || '(555) 000-0000',
      morningBusStatus: morningStatus,
      schoolStatus: schoolStatus,
      eveningBusStatus: eveningStatus,
      unifiedStatus: unified
    };

    onAdd(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Add Student to Transit Record</h3>
              <p className="text-xs text-slate-400">Registers student for bus routes and school presence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Liam Henderson"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Student ID / Barcode *</label>
              <input
                type="text"
                required
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Grade Level</label>
              <input
                type="text"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                placeholder="e.g. 5th Grade"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Homeroom / Section</label>
              <input
                type="text"
                value={homeroom}
                onChange={e => setHomeroom(e.target.value)}
                placeholder="e.g. Room 312 (Mr. Harris)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Bus Route</label>
              <select
                value={routeNumber}
                onChange={e => setRouteNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {routes.map(r => (
                  <option key={r.routeNumber} value={r.routeNumber}>
                    {r.routeNumber} - {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bus Stop Location</label>
              <input
                type="text"
                value={busStop}
                onChange={e => setBusStop(e.target.value)}
                placeholder="e.g. Oak St & 5th Ave"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Guardian Name</label>
              <input
                type="text"
                value={guardianName}
                onChange={e => setGuardianName(e.target.value)}
                placeholder="e.g. Rachel Henderson"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Emergency Phone</label>
              <input
                type="text"
                value={guardianPhone}
                onChange={e => setGuardianPhone(e.target.value)}
                placeholder="e.g. (555) 234-5678"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add to Active Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { SriLankaStudent, SriLankaVan } from '../data/sriLankaData';
import { 
  User, 
  X, 
  Save, 
  Trash2, 
  Phone, 
  MapPin, 
  Bus, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface SriLankaStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: SriLankaStudent | null;
  vans: SriLankaVan[];
  lang: 'si' | 'en' | 'ta';
  onSave: (updatedStudent: SriLankaStudent) => void;
  onDelete?: (id: string) => void;
}

export const SriLankaStudentModal: React.FC<SriLankaStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  vans,
  lang,
  onSave,
  onDelete
}) => {
  if (!isOpen) return null;

  const isCreating = !student;

  const [name, setName] = useState(student?.name || '');
  const [nameSi, setNameSi] = useState(student?.nameSi || '');
  const [grade, setGrade] = useState(student?.grade || 'Grade 5 - A');
  const [vanNumber, setVanNumber] = useState(student?.vanNumber || (vans[0]?.vanNumber || ''));
  const [pickupLocation, setPickupLocation] = useState(student?.pickupLocation || '');
  const [parentName, setParentName] = useState(student?.parentName || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '077');
  const [monthlyRate, setMonthlyRate] = useState<number>(student?.monthlyRate || 7500);

  const handleSave = () => {
    if (!name.trim()) {
      alert(lang === 'si' ? 'කරුණාකර ළමයාගේ නම ඇතුලත් කරන්න.' : 'Please enter student name.');
      return;
    }

    const assignedVanObj = vans.find(v => v.vanNumber === vanNumber);
    const routeTitle = assignedVanObj ? assignedVanObj.routeTitle : 'School Route';

    const savedRecord: SriLankaStudent = {
      id: student?.id || `sl-${Date.now()}`,
      name: name.trim(),
      nameSi: nameSi.trim() || undefined,
      grade: grade.trim(),
      vanNumber: vanNumber,
      vanRoute: routeTitle,
      pickupLocation: pickupLocation.trim() || 'Bus Stop',
      parentName: parentName.trim() || 'Parent',
      parentPhone: parentPhone.trim() || '0771234567',
      morningStatus: student?.morningStatus || 'Pending',
      morningTime: student?.morningTime,
      schoolStatus: student?.schoolStatus || 'Pending',
      eveningStatus: student?.eveningStatus || 'Pending',
      eveningTime: student?.eveningTime,
      monthlyRate: Number(monthlyRate) > 0 ? Number(monthlyRate) : 7500
    };

    onSave(savedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isCreating 
                  ? (lang === 'si' ? 'අලුත් ළමයෙකු ඇතුලත් කිරීම' : 'Add New Student') 
                  : (lang === 'si' ? 'ළමයාගේ තොරතුරු සංස්කරණය' : 'Edit Student & Bus')}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'si' ? 'නම, අදාළ වෑන් රථය, නැවතුම සහ දුරකථන අංකය' : 'Update name, assigned van, halting stop & phone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'si' ? 'ළමයාගේ නම (Student Name in English)' : 'Student Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Kaveesha Perera"
                className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'si' ? 'නම සිංහලෙන් (Sinhala Name - Optional)' : 'Sinhala Name'}
              </label>
              <input
                type="text"
                value={nameSi}
                onChange={e => setNameSi(e.target.value)}
                placeholder="e.g. කවීෂා පෙරේරා"
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'si' ? 'පන්තිය (Grade / Class)' : 'Grade'}
              </label>
              <input
                type="text"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                placeholder="e.g. Grade 5 - B"
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* ASSIGNED VAN DROPDOWN */}
            <div>
              <label className="text-xs font-bold text-amber-900 block mb-1 flex items-center gap-1">
                <Bus className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'si' ? 'වෑන් රථය (Assigned Van)' : 'School Van'}</span>
              </label>
              <select
                value={vanNumber}
                onChange={e => setVanNumber(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-amber-50 border border-amber-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-amber-500"
              >
                {vans.map(v => (
                  <option key={v.vanNumber} value={v.vanNumber}>
                    {v.vanNumber} ({v.driverName})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'si' ? 'නැවතුම් ස්ථානය (Halting / Pickup Stop)' : 'Halting Stop'}
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={e => setPickupLocation(e.target.value)}
                placeholder="e.g. Delkanda Junction (දෙල්කන්ද හන්දිය)"
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'si' ? 'දෙමාපියන්ගේ නම (Parent Name)' : 'Parent Name'}
              </label>
              <input
                type="text"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                placeholder="e.g. Nirosha Perera (Mother)"
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-800 block mb-1">
                {lang === 'si' ? 'දෙමාපිය දුරකථනය / WhatsApp' : 'Parent Phone (WhatsApp)'}
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                placeholder="e.g. 077 123 4567"
                className="w-full text-xs font-bold px-3 py-2 bg-emerald-50 border border-emerald-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* MONTHLY ESTIMATED VAN RATE (DIFFERENT PER CHILD) */}
            <div className="sm:col-span-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <span>💰 {lang === 'si' ? 'මාසික ඇස්තමේන්තු ගාස්තුව (Monthly Van Fee Rate)' : 'Est. Monthly Rate (LKR)'}</span>
                </label>
                <span className="text-[10px] font-semibold text-amber-700">
                  {lang === 'si' ? 'ළමයාගේ දුර / නැවතුම අනුව වෙන වෙනම නියම කරන්න' : 'Set individual rate per student'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                  Rs.
                </span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={monthlyRate}
                  onChange={e => setMonthlyRate(Number(e.target.value))}
                  placeholder="7500"
                  className="w-full text-xs font-black pl-10 pr-3 py-2 bg-white border border-amber-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-slate-500 font-medium">{lang === 'si' ? 'ඉක්මන් තේරීම්:' : 'Presets:'}</span>
                {[6000, 6500, 7000, 7500, 8000, 8500, 10000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMonthlyRate(val)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                      monthlyRate === val
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                        : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Rs. {val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {!isCreating && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(lang === 'si' ? 'මෙම ළමයා ලැයිස්තුවෙන් ඉවත් කිරීමට අවශ්‍යද?' : 'Remove this student?')) {
                  onDelete(student.id);
                  onClose();
                }
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              {lang === 'si' ? 'අවලංගුයි (Cancel)' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'si' ? 'සුරකින්න (Save)' : 'Save Student'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

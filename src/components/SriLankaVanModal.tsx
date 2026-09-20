import React, { useState } from 'react';
import { SriLankaVan, SriLankaStudent } from '../data/sriLankaData';
import { 
  Bus, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  Users
} from 'lucide-react';

interface SriLankaVanModalProps {
  isOpen: boolean;
  onClose: () => void;
  vans: SriLankaVan[];
  students: SriLankaStudent[];
  lang: 'si' | 'en' | 'ta';
  onSaveVans: (updatedVans: SriLankaVan[]) => void;
  onRenameVanInStudents?: (oldVanNumber: string, newVanNumber: string) => void;
}

export const SriLankaVanModal: React.FC<SriLankaVanModalProps> = ({
  isOpen,
  onClose,
  vans,
  students,
  lang,
  onSaveVans,
  onRenameVanInStudents
}) => {
  if (!isOpen) return null;

  const [localVans, setLocalVans] = useState<SriLankaVan[]>(vans);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SriLankaVan>({
    vanNumber: '',
    driverName: '',
    driverPhone: '',
    routeTitle: '',
    routeTowns: ''
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState<SriLankaVan>({
    vanNumber: `Van 0${localVans.length + 1} (WP NA-${Math.floor(1000 + Math.random() * 9000)})`,
    driverName: '',
    driverPhone: '077 ',
    routeTitle: '',
    routeTowns: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const startEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditForm({ ...localVans[idx] });
    setIsAdding(false);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const oldVan = localVans[editingIndex];
    const updated = [...localVans];
    updated[editingIndex] = editForm;
    setLocalVans(updated);
    onSaveVans(updated);

    if (onRenameVanInStudents && oldVan.vanNumber !== editForm.vanNumber) {
      onRenameVanInStudents(oldVan.vanNumber, editForm.vanNumber);
    }

    setEditingIndex(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const deleteVan = (idx: number) => {
    const vanToDelete = localVans[idx];
    const assignedCount = students.filter(s => s.vanNumber === vanToDelete.vanNumber).length;
    
    if (assignedCount > 0) {
      const confirm = window.confirm(
        lang === 'si'
          ? `අවධානයයි: මෙම වෑන් රථයට ළමුන් ${assignedCount} දෙනෙක් ඇතුලත් කර ඇත. ඔබට මෙම වෑන් රථය මකා දැමීමට අවශ්‍යද?`
          : `Warning: ${assignedCount} student(s) are assigned to ${vanToDelete.vanNumber}. Delete anyway?`
      );
      if (!confirm) return;
    }

    const updated = localVans.filter((_, i) => i !== idx);
    setLocalVans(updated);
    onSaveVans(updated);
    if (editingIndex === idx) setEditingIndex(null);
  };

  const addNewVan = () => {
    if (!newForm.vanNumber.trim() || !newForm.driverName.trim()) {
      alert(lang === 'si' ? 'කරුණාකර වෑන් අංකය සහ රියදුරුගේ නම ඇතුලත් කරන්න.' : 'Please provide Van Number and Driver Name.');
      return;
    }

    const updated = [...localVans, newForm];
    setLocalVans(updated);
    onSaveVans(updated);
    setIsAdding(false);
    setNewForm({
      vanNumber: `Van 0${updated.length + 1} (WP NA-${Math.floor(1000 + Math.random() * 9000)})`,
      driverName: '',
      driverPhone: '077 ',
      routeTitle: '',
      routeTowns: ''
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-xs">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {lang === 'si' ? 'පාසල් වෑන් සහ රියදුරු තොරතුරු සංස්කරණය' : 'Edit School Vans & Drivers'}
              </h2>
              <p className="text-xs font-medium text-amber-950">
                {lang === 'si' ? 'වෑන් අංකය, අංකල්ගේ නම, දුරකථන අංකය සහ මාර්ගය වෙනස් කරන්න' : 'Update van numbers, uncle names, phones & routes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-900 hover:text-white p-1.5 rounded-lg hover:bg-slate-950/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'si' ? 'වෑන් තොරතුරු සාර්ථකව සුරැකිණි!' : 'Van details saved successfully!'}
              </span>
            </div>
          )}

          {/* Action Bar */}
          {!isAdding ? (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {lang === 'si' ? `ලියාපදිංචි වෑන් රථ (${localVans.length})` : `Registered Vans (${localVans.length})`}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'si' ? 'ඕනෑම වෑන් රථයක විස්තර Edit කරන්න හෝ අලුත් එකක් එකතු කරන්න' : 'Click edit to change details or add a new school van'}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditingIndex(null);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'si' ? 'අලුත් වෑන් රථයක් ඇතුලත් කරන්න' : 'Add New Van'}</span>
              </button>
            </div>
          ) : (
            /* Add Van Form */
            <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'si' ? 'අලුත් වෑන් රථයක් එක් කිරීම' : 'Add New Van'}</span>
                </span>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === 'si' ? 'වෑන් අංකය (Van Number / Plate)' : 'Van Number'}
                  </label>
                  <input
                    type="text"
                    value={newForm.vanNumber}
                    onChange={e => setNewForm({ ...newForm, vanNumber: e.target.value })}
                    placeholder="e.g. Van 04 (WP NC-9988)"
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === 'si' ? 'රියදුරුගේ නම (Driver / Uncle Name)' : 'Driver Name'}
                  </label>
                  <input
                    type="text"
                    value={newForm.driverName}
                    onChange={e => setNewForm({ ...newForm, driverName: e.target.value })}
                    placeholder="e.g. Nimal Uncle (නිමල් අංකල්)"
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === 'si' ? 'දුරකථන අංකය (Driver Phone)' : 'Driver Phone'}
                  </label>
                  <input
                    type="text"
                    value={newForm.driverPhone}
                    onChange={e => setNewForm({ ...newForm, driverPhone: e.target.value })}
                    placeholder="e.g. 077 123 4567"
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === 'si' ? 'මාර්ගයේ නම (Route Title)' : 'Route Title'}
                  </label>
                  <input
                    type="text"
                    value={newForm.routeTitle}
                    onChange={e => setNewForm({ ...newForm, routeTitle: e.target.value })}
                    placeholder="e.g. Kottawa ⇄ Bambalapitiya"
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === 'si' ? 'නැවතුම් නගර (Towns / Halts)' : 'Towns / Halting Stops'}
                  </label>
                  <input
                    type="text"
                    value={newForm.routeTowns}
                    onChange={e => setNewForm({ ...newForm, routeTowns: e.target.value })}
                    placeholder="e.g. Kottawa, Pannipitiya, Maharagama, Nugegoda"
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addNewVan}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{lang === 'si' ? 'වෑන් රථය සුරකින්න' : 'Save Van'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Existing Vans List */}
          <div className="space-y-3">
            {localVans.map((van, idx) => {
              const assignedCount = students.filter(s => s.vanNumber === van.vanNumber).length;
              const isEditingThis = editingIndex === idx;

              if (isEditingThis) {
                return (
                  <div key={idx} className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>{lang === 'si' ? `සංස්කරණය: ${van.vanNumber}` : `Editing ${van.vanNumber}`}</span>
                      </span>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {lang === 'si' ? 'වෑන් අංකය (Van Number / Plate)' : 'Van Number'}
                        </label>
                        <input
                          type="text"
                          value={editForm.vanNumber}
                          onChange={e => setEditForm({ ...editForm, vanNumber: e.target.value })}
                          className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {lang === 'si' ? 'රියදුරුගේ නම (Driver / Uncle Name)' : 'Driver Name'}
                        </label>
                        <input
                          type="text"
                          value={editForm.driverName}
                          onChange={e => setEditForm({ ...editForm, driverName: e.target.value })}
                          className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {lang === 'si' ? 'දුරකථන අංකය (Driver Phone)' : 'Driver Phone'}
                        </label>
                        <input
                          type="text"
                          value={editForm.driverPhone}
                          onChange={e => setEditForm({ ...editForm, driverPhone: e.target.value })}
                          className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {lang === 'si' ? 'මාර්ගයේ නම (Route Title)' : 'Route Title'}
                        </label>
                        <input
                          type="text"
                          value={editForm.routeTitle}
                          onChange={e => setEditForm({ ...editForm, routeTitle: e.target.value })}
                          className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {lang === 'si' ? 'නැවතුම් නගර (Towns / Halts)' : 'Towns / Halts'}
                        </label>
                        <input
                          type="text"
                          value={editForm.routeTowns}
                          onChange={e => setEditForm({ ...editForm, routeTowns: e.target.value })}
                          className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{lang === 'si' ? 'වෙනස්කම් සුරකින්න' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-950 text-sm">{van.vanNumber}</span>
                      <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                        {assignedCount} {lang === 'si' ? 'ළමුන්' : 'Students'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                      <span>{van.driverName}</span>
                      {van.driverPhone && (
                        <span className="text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{van.driverPhone}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{van.routeTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => startEdit(idx)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      title="Edit van details"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lang === 'si' ? 'වෙනස් කරන්න (Edit)' : 'Edit'}</span>
                    </button>

                    <button
                      onClick={() => deleteVan(idx)}
                      className="p-1.5 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                      title="Delete van"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {lang === 'si' ? 'වෑන් අංකය වෙනස් කළ විට අදාළ ළමයින්ගේ තොරතුරුද ඉබේම යාවත්කාලීන වේ.' : 'Editing van numbers updates assigned students automatically.'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {lang === 'si' ? 'වසන්න (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

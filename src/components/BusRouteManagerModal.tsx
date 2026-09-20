import React, { useState } from 'react';
import { RouteInfo, StudentTransitRecord } from '../types';
import { 
  Bus, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  Phone, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface BusRouteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: RouteInfo[];
  records: StudentTransitRecord[];
  onSaveRoutes: (updatedRoutes: RouteInfo[]) => void;
  onUpdateStudentRouteNumber?: (oldRouteNumber: string, newRouteNumber: string) => void;
}

export const BusRouteManagerModal: React.FC<BusRouteManagerModalProps> = ({
  isOpen,
  onClose,
  routes,
  records,
  onSaveRoutes,
  onUpdateStudentRouteNumber
}) => {
  if (!isOpen) return null;

  const [localRoutes, setLocalRoutes] = useState<RouteInfo[]>(routes);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<RouteInfo>({
    routeNumber: '',
    routeName: '',
    driverName: '',
    busCapacity: 45,
    contactNumber: ''
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState<RouteInfo>({
    routeNumber: `Route ${Math.floor(100 + Math.random() * 900)}`,
    routeName: '',
    driverName: '',
    busCapacity: 45,
    contactNumber: ''
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Start editing a route
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...localRoutes[index] });
    setIsAdding(false);
  };

  // Save the edited route
  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const oldRoute = localRoutes[editingIndex];
    const updated = [...localRoutes];
    updated[editingIndex] = editForm;
    setLocalRoutes(updated);
    onSaveRoutes(updated);

    if (onUpdateStudentRouteNumber && oldRoute.routeNumber !== editForm.routeNumber) {
      onUpdateStudentRouteNumber(oldRoute.routeNumber, editForm.routeNumber);
    }

    setEditingIndex(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Delete a route
  const handleDeleteRoute = (index: number) => {
    const routeToDelete = localRoutes[index];
    const assignedCount = records.filter(r => r.routeNumber === routeToDelete.routeNumber).length;
    
    if (assignedCount > 0) {
      const confirm = window.confirm(
        `Warning: ${assignedCount} student(s) are currently assigned to ${routeToDelete.routeNumber}. Are you sure you want to delete this bus route?`
      );
      if (!confirm) return;
    }

    const updated = localRoutes.filter((_, i) => i !== index);
    setLocalRoutes(updated);
    onSaveRoutes(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // Add new route
  const handleAddRoute = () => {
    if (!newForm.routeNumber.trim() || !newForm.routeName.trim()) {
      alert('Please provide a Route Number and Route Name.');
      return;
    }

    const updated = [...localRoutes, newForm];
    setLocalRoutes(updated);
    onSaveRoutes(updated);
    setIsAdding(false);
    setNewForm({
      routeNumber: `Route ${Math.floor(100 + Math.random() * 900)}`,
      routeName: '',
      driverName: '',
      busCapacity: 45,
      contactNumber: ''
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Manage School Buses & Routes</h2>
              <p className="text-xs text-slate-400">Edit bus numbers, drivers, capacities, and phone numbers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bus route information saved successfully!</span>
            </div>
          )}

          {/* Add New Bus Button / Form */}
          {!isAdding ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Fleet ({localRoutes.length} Buses)</h3>
                <p className="text-xs text-slate-500">Edit driver details or add new buses to your transportation list.</p>
              </div>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditingIndex(null);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New School Bus</span>
              </button>
            </div>
          ) : (
            <div className="bg-amber-50/50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Add New Bus Route</span>
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
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Route / Bus #</label>
                  <input
                    type="text"
                    value={newForm.routeNumber}
                    onChange={e => setNewForm({ ...newForm, routeNumber: e.target.value })}
                    placeholder="e.g. Route 501 or Bus 12"
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Route Name / Service Area</label>
                  <input
                    type="text"
                    value={newForm.routeName}
                    onChange={e => setNewForm({ ...newForm, routeName: e.target.value })}
                    placeholder="e.g. Westside Parkways"
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={newForm.driverName}
                    onChange={e => setNewForm({ ...newForm, driverName: e.target.value })}
                    placeholder="e.g. Robert Smith"
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Driver Contact Phone</label>
                  <input
                    type="text"
                    value={newForm.contactNumber}
                    onChange={e => setNewForm({ ...newForm, contactNumber: e.target.value })}
                    placeholder="e.g. (555) 123-4567 or 077 123 4567"
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Bus Seating Capacity</label>
                  <input
                    type="number"
                    value={newForm.busCapacity}
                    onChange={e => setNewForm({ ...newForm, busCapacity: parseInt(e.target.value) || 40 })}
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
                  onClick={handleAddRoute}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save New Bus</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Existing Buses */}
          <div className="space-y-3">
            {localRoutes.map((route, idx) => {
              const assignedCount = records.filter(r => r.routeNumber === route.routeNumber).length;
              const isCurrentlyEditing = editingIndex === idx;

              if (isCurrentlyEditing) {
                return (
                  <div key={idx} className="bg-amber-50/80 border-2 border-amber-400 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Editing {route.routeNumber}</span>
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
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Route / Bus #</label>
                        <input
                          type="text"
                          value={editForm.routeNumber}
                          onChange={e => setEditForm({ ...editForm, routeNumber: e.target.value })}
                          className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Route Name</label>
                        <input
                          type="text"
                          value={editForm.routeName}
                          onChange={e => setEditForm({ ...editForm, routeName: e.target.value })}
                          className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Driver Name</label>
                        <input
                          type="text"
                          value={editForm.driverName}
                          onChange={e => setEditForm({ ...editForm, driverName: e.target.value })}
                          className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Driver Phone</label>
                        <input
                          type="text"
                          value={editForm.contactNumber}
                          onChange={e => setEditForm({ ...editForm, contactNumber: e.target.value })}
                          className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Capacity</label>
                        <input
                          type="number"
                          value={editForm.busCapacity}
                          onChange={e => setEditForm({ ...editForm, busCapacity: parseInt(e.target.value) || 40 })}
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
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
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
                      <span className="font-black text-slate-900 text-sm">{route.routeNumber}</span>
                      <span className="text-xs text-slate-600 font-semibold">· {route.routeName}</span>
                      <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                        {assignedCount} / {route.busCapacity} Seats
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                      <span className="font-medium">
                        Driver: <strong className="text-slate-800">{route.driverName || 'Not Assigned'}</strong>
                      </span>
                      {route.contactNumber && (
                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{route.contactNumber}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleStartEdit(idx)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      title="Edit this bus route"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteRoute(idx)}
                      className="p-1.5 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                      title="Delete this bus route"
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
            Changes update the live dropdowns in student edit modals and route filters.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

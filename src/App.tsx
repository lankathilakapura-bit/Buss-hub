/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentTransitRecord } from './types';
import { INITIAL_STUDENTS, INITIAL_ROUTES } from './data/initialData';
import { Navbar } from './components/Navbar';
import { LiveTracker } from './components/LiveTracker';
import { SchemaDesigner } from './components/SchemaDesigner';
import { FormulaGenerator } from './components/FormulaGenerator';
import { AppsScriptStudio } from './components/AppsScriptStudio';
import { QuickstartGuide } from './components/QuickstartGuide';
import { StudentModal } from './components/StudentModal';
import { AddStudentModal } from './components/AddStudentModal';
import { SriLankaEasyMode } from './components/SriLankaEasyMode';
import { BusRouteManagerModal } from './components/BusRouteManagerModal';
import { BusLiveMap } from './components/BusLiveMap';
import { RouteInfo } from './types';
import { Bus, ShieldAlert, Sparkles, FileSpreadsheet, Code2 } from 'lucide-react';

const STORAGE_KEY = 'transittrack_students_v1';
const ROUTES_STORAGE_KEY = 'transittrack_routes_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'bus' | 'parent' | 'split' | 'map' | 'tracker' | 'schema' | 'formulas' | 'script' | 'guide'>('bus');
  const [records, setRecords] = useState<StudentTransitRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to initial
    }
    return INITIAL_STUDENTS;
  });

  const [routes, setRoutes] = useState<RouteInfo[]>(() => {
    try {
      const saved = localStorage.getItem(ROUTES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to initial routes
    }
    return INITIAL_ROUTES;
  });

  const [selectedStudent, setSelectedStudent] = useState<StudentTransitRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRouteManagerOpen, setIsRouteManagerOpen] = useState(false);

  // Sync to local storage for realistic persistent session experience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
    } catch {
      // ignore
    }
  }, [routes]);

  const handleUpdateRecord = (updated: StudentTransitRecord) => {
    setRecords(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    if (selectedStudent && selectedStudent.id === updated.id) {
      setSelectedStudent(updated);
    }
  };

  const handleBatchUpdate = (updater: (rec: StudentTransitRecord) => StudentTransitRecord) => {
    setRecords(prev => prev.map(updater));
  };

  const handleAddStudent = (newRecord: StudentTransitRecord) => {
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteStudent = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateStudentRouteNumber = (oldRouteNumber: string, newRouteNumber: string) => {
    setRecords(prev => prev.map(r => r.routeNumber === oldRouteNumber ? { ...r, routeNumber: newRouteNumber } : r));
  };

  const criticalAlertsCount = records.filter(
    r => r.unifiedStatus === 'CRITICAL: Boarded Bus but Missing at School'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      {/* Primary Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalAlertsCount={criticalAlertsCount}
        totalStudents={records.length}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(activeTab === 'bus' || activeTab === 'parent' || activeTab === 'split') && (
          <SriLankaEasyMode
            page={activeTab}
            onPageChange={(page) => {
              if (page === 'bus' || page === 'parent' || page === 'split') {
                setActiveTab(page);
              }
            }}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('bus')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>← Return to Bus Console (1st Page)</span>
              </button>
            </div>
            <BusLiveMap onClose={() => setActiveTab('bus')} />
          </div>
        )}

        {activeTab === 'tracker' && (
          <LiveTracker
            records={records}
            routes={routes}
            onUpdateRecord={handleUpdateRecord}
            onBatchUpdate={handleBatchUpdate}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSelectStudent={rec => setSelectedStudent(rec)}
            onOpenRouteManager={() => setIsRouteManagerOpen(true)}
          />
        )}

        {activeTab === 'schema' && <SchemaDesigner />}

        {activeTab === 'formulas' && <FormulaGenerator />}

        {activeTab === 'script' && <AppsScriptStudio />}

        {activeTab === 'guide' && <QuickstartGuide />}
      </main>

      {/* Modals */}
      <StudentModal
        record={selectedStudent}
        routes={routes}
        onClose={() => setSelectedStudent(null)}
        onSave={handleUpdateRecord}
        onDelete={handleDeleteStudent}
      />

      <AddStudentModal
        isOpen={isAddModalOpen}
        routes={routes}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStudent}
      />

      <BusRouteManagerModal
        isOpen={isRouteManagerOpen}
        onClose={() => setIsRouteManagerOpen(false)}
        routes={routes}
        records={records}
        onSaveRoutes={setRoutes}
        onUpdateStudentRouteNumber={handleUpdateStudentRouteNumber}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TransitTrack Attendance System</span>
            <span>·</span>
            <span>Unified Morning Bus, Homeroom Presence & Evening Dismissal</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('schema')}
              className="text-slate-600 hover:text-amber-600 transition-colors"
            >
              Schema Specification
            </button>
            <button
              onClick={() => setActiveTab('formulas')}
              className="text-slate-600 hover:text-amber-600 transition-colors"
            >
              Formula Engine
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className="text-slate-600 hover:text-amber-600 transition-colors"
            >
              Apps Script (.gs)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

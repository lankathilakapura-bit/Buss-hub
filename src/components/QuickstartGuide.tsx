import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Users, 
  BellRing, 
  Clock, 
  FileSpreadsheet, 
  ExternalLink 
} from 'lucide-react';

export const QuickstartGuide: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-700 text-white shadow-md">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Operational Best Practices & Deployment</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
          Complete School Transit & Attendance Operations Guide
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
          Everything your transportation director, bus drivers, homeroom teachers, and front office staff need to operate a zero-error student attendance workflow.
        </p>
      </div>

      {/* 5-Step Rapid Deployment Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-600" />
          <span>5-Step Setup Checklist for Google Sheets</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Create Google Sheet & Paste Headers
              </h4>
              <p className="text-xs text-slate-600">
                Create a new Google Sheet at <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-medium">sheets.new <ExternalLink className="w-3 h-3" /></a>. Rename the tab to <code className="font-mono bg-slate-200 px-1 rounded">Daily_Transit_Attendance</code>. Click <strong>"Copy for Google Sheets (Ctrl+V)"</strong> in the <em>Sheet Schema</em> tab and paste into cell A1.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Configure Dropdown Validation with Colors
              </h4>
              <p className="text-xs text-slate-600">
                Select Column G (Morning Bus Status) and add dropdown options: <code className="bg-slate-200 px-1 rounded">Boarded</code> (Green), <code className="bg-slate-200 px-1 rounded">Absent</code> (Red), <code className="bg-slate-200 px-1 rounded">Parent Transit</code> (Blue), <code className="bg-slate-200 px-1 rounded">Walk</code> (Slate). Repeat for Column I (School Presence) and Column K (Evening Bus).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Insert Single-Cell Spill ARRAYFORMULA in Cell M2
              </h4>
              <p className="text-xs text-slate-600">
                Go to the <em>Formulas Library</em> tab and copy the <strong>Auto-Spill ARRAYFORMULA (MAP/LAMBDA)</strong>. Paste it into cell M2. It will automatically populate the entire column without needing manual drag-fill!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Install Apps Script for Driver Auto-Timestamping
              </h4>
              <p className="text-xs text-slate-600">
                Go to <em>Extensions &gt; Apps Script</em> in Google Sheets. Paste the complete script from the <em>Apps Script (GAS)</em> tab. This automatically records exact timestamps the millisecond a bus driver marks a student "Boarded", saving drivers from typing clock times on mobile.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              5
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Setup Daily 9:15 AM Discrepancy Trigger (Optional Automation)
              </h4>
              <p className="text-xs text-slate-600">
                In Apps Script, click the clock icon (Triggers) on the left sidebar &gt; <em>Add Trigger</em> &gt; choose function <code className="bg-slate-200 px-1 rounded">sendDiscrepancyAlerts</code> &gt; Time-driven &gt; Day timer &gt; 9:00 AM to 10:00 AM. If any student boarded the bus but was not marked present in homeroom, the administration will get an immediate urgent safety alert email!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Operational Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">For Bus Drivers & Aides</h4>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>Open sheet on mobile phone or tablet dashboard mount.</li>
            <li>Filter view by your assigned Route # (e.g. Route 101).</li>
            <li>Tap <strong>Boarded</strong> as each student steps onto the bus. Timestamp logs automatically.</li>
            <li>If a parent meets you at the curb saying they will drive the student, tap <strong>Parent Transit</strong>.</li>
            <li>At afternoon drop-off, tap <strong>Boarded Bus</strong> and confirm safe disembarkation.</li>
          </ul>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">For Homeroom Teachers & Staff</h4>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>Take standard morning roll call at the 8:05 AM morning bell.</li>
            <li>Mark <strong>Present</strong>, <strong>Absent</strong>, or <strong>Tardy</strong> in Column I.</li>
            <li>Teachers do not need to check bus logs — the formula immediately reconciles both data points.</li>
            <li>Any student arriving late to the office is marked <strong>Tardy</strong> with entrance timestamp.</li>
          </ul>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">For Safety & Front Desk Office</h4>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>Check the <em>Daily_Safety_Dashboard</em> tab or the red banner in this app at 8:30 AM.</li>
            <li>If a red <strong>CRITICAL</strong> discrepancy appears, immediately call the bus driver to verify if student physically boarded.</li>
            <li>Call the parent's emergency phone from Column N to verify if student was dropped off or went elsewhere.</li>
            <li>Check school hallways, nurse's office, or library.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

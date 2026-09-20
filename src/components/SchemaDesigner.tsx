import React, { useState } from 'react';
import { TEMPLATE_COLUMNS, SHEET_TABS_SPECIFICATION } from '../data/templateSchema';
import { INITIAL_STUDENTS } from '../data/initialData';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Table, 
  Sparkles,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export const SchemaDesigner: React.FC = () => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('Daily_Transit_Attendance');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Generate TSV for direct paste into blank Google Sheet
  const generateTSV = () => {
    const headers = TEMPLATE_COLUMNS.map(c => c.header).join('\t');
    const rows = INITIAL_STUDENTS.map(s => [
      '2026-09-18',
      s.studentId,
      s.name,
      s.grade,
      s.routeNumber,
      s.busStop,
      s.morningBusStatus,
      s.morningPickupTime || '',
      s.schoolStatus,
      s.schoolCheckTime || '',
      s.eveningBusStatus,
      s.eveningDropTime || '',
      s.unifiedStatus,
      s.guardianPhone,
      s.specialNotes || s.morningAideNotes || ''
    ].join('\t'));

    return [headers, ...rows].join('\n');
  };

  const handleCopyTSV = () => {
    copyToClipboard(generateTSV(), 'tsv');
  };

  const handleCopyHeadersOnly = () => {
    const headers = TEMPLATE_COLUMNS.map(c => c.header).join('\t');
    copyToClipboard(headers, 'headers');
  };

  const handleDownloadCSV = () => {
    const headers = TEMPLATE_COLUMNS.map(c => `"${c.header}"`).join(',');
    const rows = INITIAL_STUDENTS.map(s => [
      '"2026-09-18"',
      `"${s.studentId}"`,
      `"${s.name}"`,
      `"${s.grade}"`,
      `"${s.routeNumber}"`,
      `"${s.busStop.replace(/"/g, '""')}"`,
      `"${s.morningBusStatus}"`,
      `"${s.morningPickupTime || ''}"`,
      `"${s.schoolStatus}"`,
      `"${s.schoolCheckTime || ''}"`,
      `"${s.eveningBusStatus}"`,
      `"${s.eveningDropTime || ''}"`,
      `"${s.unifiedStatus.replace(/"/g, '""')}"`,
      `"${s.guardianPhone}"`,
      `"${(s.specialNotes || s.morningAideNotes || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'School_Transit_Daily_Attendance_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Export Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-700 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unified Data Architecture Specification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Google Sheets Clean Template Structure
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Engineered to unify morning bus boarding, classroom homeroom presence, and afternoon bus dismissal into a single row per student with zero redundancy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-copy-tsv"
              onClick={handleCopyTSV}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors"
              title="Copy formatted table to paste directly with Ctrl+V into blank Google Sheet"
            >
              {copiedType === 'tsv' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedType === 'tsv' ? 'Copied! Paste into Sheets' : 'Copy for Google Sheets (Ctrl+V)'}</span>
            </button>

            <button
              id="btn-download-csv"
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs rounded-xl flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleCopyHeadersOnly}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-600 transition-colors"
            >
              {copiedType === 'headers' ? 'Copied Headers' : 'Copy Headers Only'}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Tab Architecture Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Recommended Multi-Tab Spreadsheet Architecture</span>
          </h3>
          <span className="text-xs text-slate-500">4 Synchronized Tabs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHEET_TABS_SPECIFICATION.map(tab => (
            <div
              key={tab.tabName}
              onClick={() => setSelectedTab(tab.tabName)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTab === tab.tabName
                  ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {tab.tabName}
                </span>
                {selectedTab === tab.tabName && (
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                {tab.purpose}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700">Columns: </span>
                <span>{tab.keyColumns}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Data Dictionary: Daily_Transit_Attendance Columns */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-amber-600" />
              <span>Tab Schema: Daily_Transit_Attendance (Columns A – O)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact column layout, data types, dropdown validation lists, and formula anchors.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            15 Production Columns
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-3 w-12 text-center">Col</th>
                <th className="py-3 px-4 min-w-[160px]">Field Name</th>
                <th className="py-3 px-3 min-w-[100px]">Data Type</th>
                <th className="py-3 px-4 min-w-[200px]">Dropdown Validation / Formula</th>
                <th className="py-3 px-4 min-w-[260px]">Description & Functional Purpose</th>
                <th className="py-3 px-3 min-w-[130px]">Sample Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {TEMPLATE_COLUMNS.map((col, idx) => {
                const isFormula = col.type === 'Formula';
                const isDropdown = col.type === 'Dropdown';

                return (
                  <tr key={col.colIndex} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="py-3 px-3 font-mono font-bold text-center text-slate-700 bg-slate-100/50">
                      {col.colIndex}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {col.header}
                      </div>
                      {col.required ? (
                        <span className="text-[10px] text-red-600 font-medium">Required</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Optional</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        col.type === 'Formula' 
                          ? 'bg-purple-100 text-purple-800 font-semibold'
                          : col.type === 'Dropdown'
                          ? 'bg-amber-100 text-amber-800'
                          : col.type === 'Time' || col.type === 'Date'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {col.type}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isDropdown && col.validationOptions && (
                        <div className="flex flex-wrap gap-1">
                          {col.validationOptions.map(opt => (
                            <span 
                              key={opt}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}

                      {isFormula && (
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] bg-purple-50 text-purple-900 p-1.5 rounded border border-purple-200 block truncate max-w-[240px]" title={col.formula}>
                            {col.formula}
                          </span>
                          <span className="text-[10px] text-purple-700 flex items-center gap-1 font-medium">
                            <Sparkles className="w-3 h-3" /> Auto-reconciles safety state
                          </span>
                        </div>
                      )}

                      {!isDropdown && !isFormula && (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-xs leading-relaxed">
                      {col.description}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-800 bg-slate-50/50">
                      {col.example}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to configure Data Validation in Google Sheets */}
      <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-xl">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Setting Up Google Sheets Dropdowns in 3 Clicks:</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs text-slate-700">
          <div className="p-3 bg-white rounded-lg border border-amber-200/80">
            <span className="font-bold text-amber-800">1. Select Column G</span>
            <p className="mt-1 text-slate-600">
              Highlight cells <code className="font-mono text-amber-900 bg-amber-100 px-1 py-0.5 rounded">G2:G</code>. Click <strong>Data &gt; Data validation &gt; Add rule</strong>.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200/80">
            <span className="font-bold text-amber-800">2. Set Criteria to Dropdown</span>
            <p className="mt-1 text-slate-600">
              Enter items: <code>Boarded</code>, <code>Absent</code>, <code>Parent Transit</code>, <code>Walk</code>, <code>Pending</code>.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200/80">
            <span className="font-bold text-amber-800">3. Enable Color Chips</span>
            <p className="mt-1 text-slate-600">
              Assign green for Boarded, red for Absent, blue for Parent Transit to let drivers tap quickly on mobile screens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

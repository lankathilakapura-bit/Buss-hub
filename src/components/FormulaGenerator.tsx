import React, { useState } from 'react';
import { FORMULA_TEMPLATES } from '../data/formulasData';
import { FormulaTemplate } from '../types';
import { 
  Sparkles, 
  Copy, 
  Check, 
  SlidersHorizontal, 
  Code, 
  Lightbulb, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const FormulaGenerator: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Custom Column Letter Mappings (User can adjust if their sheet layout differs)
  const [amBusCol, setAmBusCol] = useState<string>('G');
  const [schoolCol, setSchoolCol] = useState<string>('I');
  const [pmBusCol, setPmBusCol] = useState<string>('K');
  const [pmDropCol, setPmDropCol] = useState<string>('L');

  // Mini Formula Simulator State
  const [simAmStatus, setSimAmStatus] = useState<string>('Boarded');
  const [simSchoolStatus, setSimSchoolStatus] = useState<string>('Absent');
  const [simPmStatus, setSimPmStatus] = useState<string>('Pending');
  const [simPmDrop, setSimPmDrop] = useState<string>('');

  const copyFormula = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Generate dynamic formula based on user's selected column letters
  const getDynamicFormula = (tmpl: FormulaTemplate) => {
    if (tmpl.id === 'unified-status-ifs') {
      return `=IFS(
  AND(${amBusCol}2="Boarded", ${schoolCol}2="Absent"), "🚨 CRITICAL: Boarded Bus but Missing at School",
  AND(OR(${amBusCol}2="Absent", ${amBusCol}2="Parent Transit", ${amBusCol}2="Walk"), OR(${schoolCol}2="Present", ${schoolCol}2="Tardy")), "⚠️ Transit Discrepancy: Skipped Bus but Present",
  AND(OR(${schoolCol}2="Present", ${schoolCol}2="Tardy"), ${pmBusCol}2="Absent"), "⚠️ PM Attention: Present but Unaccounted for PM",
  AND(${pmBusCol}2="Boarded Bus", ${pmDropCol}2<>""), "🟢 Safe Home Drop-Off",
  AND(OR(${amBusCol}2="Boarded", ${amBusCol}2="Parent Transit", ${amBusCol}2="Walk"), OR(${schoolCol}2="Present", ${schoolCol}2="Tardy")), "🟢 Safe In Transit / Present",
  AND(OR(${amBusCol}2="Absent", ${amBusCol}2="Pending"), OR(${schoolCol}2="Absent", ${schoolCol}2="Excused")), "⚪ Full Absence Excused",
  TRUE, "🟡 Pending Confirmation"
)`;
    }

    if (tmpl.id === 'arrayformula-wrapper') {
      return `=MAP(${amBusCol}2:${amBusCol}, ${schoolCol}2:${schoolCol}, ${pmBusCol}2:${pmBusCol}, ${pmDropCol}2:${pmDropCol}, LAMBDA(g, i, k, l, 
  IF(ISBLANK(g), "", 
    IFS(
      AND(g="Boarded", i="Absent"), "🚨 CRITICAL: Boarded Bus but Missing at School",
      AND(OR(g="Absent", g="Parent Transit", g="Walk"), OR(i="Present", i="Tardy")), "⚠️ Transit Discrepancy: Skipped Bus but Present",
      AND(OR(i="Present", i="Tardy"), k="Absent"), "⚠️ PM Attention: Present but Unaccounted for PM",
      AND(k="Boarded Bus", l<>""), "🟢 Safe Home Drop-Off",
      AND(OR(g="Boarded", g="Parent Transit", g="Walk"), OR(i="Present", i="Tardy")), "🟢 Safe In Transit / Present",
      AND(OR(g="Absent", g="Pending"), OR(i="Absent", i="Excused")), "⚪ Full Absence Excused",
      TRUE, "🟡 Pending Confirmation"
    )
  )
))`;
    }

    return tmpl.formula;
  };

  // Run the simulator logic to evaluate the current inputs
  const evaluateSimulator = () => {
    if (simAmStatus === 'Boarded' && simSchoolStatus === 'Absent') {
      return {
        result: '🚨 CRITICAL: Boarded Bus but Missing at School',
        type: 'critical',
        explanation: `Condition matched: AND(${amBusCol}2="Boarded", ${schoolCol}2="Absent"). The student boarded the morning bus but was marked absent in homeroom!`
      };
    }
    if ((simAmStatus === 'Absent' || simAmStatus === 'Parent Transit' || simAmStatus === 'Walk') && (simSchoolStatus === 'Present' || simSchoolStatus === 'Tardy')) {
      return {
        result: '⚠️ Transit Discrepancy: Skipped Bus but Present',
        type: 'warning',
        explanation: `Condition matched: Bus marked ${simAmStatus}, but school marked ${simSchoolStatus}. Student traveled via private parent transit or walk.`
      };
    }
    if ((simSchoolStatus === 'Present' || simSchoolStatus === 'Tardy') && simPmStatus === 'Absent') {
      return {
        result: '⚠️ PM Attention: Present but Unaccounted for PM',
        type: 'warning',
        explanation: `Condition matched: Student was present at school today, but is marked absent from the evening bus departure lineup.`
      };
    }
    if (simPmStatus === 'Boarded Bus' && simPmDrop) {
      return {
        result: '🟢 Safe Home Drop-Off',
        type: 'success',
        explanation: `Condition matched: Evening bus boarded and drop timestamp verified at ${simPmDrop}.`
      };
    }
    if ((simAmStatus === 'Boarded' || simAmStatus === 'Parent Transit' || simAmStatus === 'Walk') && (simSchoolStatus === 'Present' || simSchoolStatus === 'Tardy')) {
      return {
        result: '🟢 Safe In Transit / Present',
        type: 'success',
        explanation: `Condition matched: Safe morning transit verified and confirmed present at school.`
      };
    }
    if ((simAmStatus === 'Absent' || simAmStatus === 'Pending') && (simSchoolStatus === 'Absent' || simSchoolStatus === 'Excused')) {
      return {
        result: '⚪ Full Absence Excused',
        type: 'neutral',
        explanation: `Condition matched: Student absent on both morning bus and school records.`
      };
    }
    return {
      result: '🟡 Pending Confirmation',
      type: 'pending',
      explanation: 'Attendance records are still pending morning bell completion.'
    };
  };

  const simResult = evaluateSimulator();

  const categories = ['All', 'Safety Reconciliation', 'Discrepancy Reporting', 'Route Capacity', 'Conditional Formatting'];
  const filteredTemplates = selectedCategory === 'All' 
    ? FORMULA_TEMPLATES 
    : FORMULA_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 rounded-2xl border border-amber-900/40 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Google Sheets Formulas & Calculation Logic</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Production-Grade Attendance & Transit Formulas
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Copy-and-paste formulas tested for Google Sheets. Dynamically cross-references morning bus boarding, school homeroom presence, and afternoon bus dismissal.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Formulas use native Google Sheets syntax (`IFS`, `MAP`, `COUNTIFS`, `FILTER`).</span>
          </div>
        </div>
      </div>

      {/* Interactive Column Mapping Adjuster */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Customize Column Letters (Dynamic Formula Updater)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Default: Standard Template Layout (A–O)
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          If your existing Google Sheet uses different columns, modify the letters below and every formula on this page will automatically adjust in real time:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              AM Bus Status Col
            </label>
            <input
              type="text"
              maxLength={2}
              value={amBusCol}
              onChange={e => setAmBusCol(e.target.value.toUpperCase())}
              className="w-full text-center font-mono font-bold text-sm px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block text-center">e.g. G (Row 2)</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              School Presence Col
            </label>
            <input
              type="text"
              maxLength={2}
              value={schoolCol}
              onChange={e => setSchoolCol(e.target.value.toUpperCase())}
              className="w-full text-center font-mono font-bold text-sm px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block text-center">e.g. I (Row 2)</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              PM Bus Status Col
            </label>
            <input
              type="text"
              maxLength={2}
              value={pmBusCol}
              onChange={e => setPmBusCol(e.target.value.toUpperCase())}
              className="w-full text-center font-mono font-bold text-sm px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block text-center">e.g. K (Row 2)</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              PM Drop-Off Time Col
            </label>
            <input
              type="text"
              maxLength={2}
              value={pmDropCol}
              onChange={e => setPmDropCol(e.target.value.toUpperCase())}
              className="w-full text-center font-mono font-bold text-sm px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block text-center">e.g. L (Row 2)</span>
          </div>
        </div>
      </div>

      {/* Live Formula Simulator Playground */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl border border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="font-bold text-sm text-white">
              Interactive Formula Testing Simulator
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-mono">
            Evaluates formula output in real-time
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1">
              Morning Bus ({amBusCol}2)
            </label>
            <select
              value={simAmStatus}
              onChange={e => setSimAmStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Boarded">Boarded</option>
              <option value="Absent">Absent</option>
              <option value="Parent Transit">Parent Transit</option>
              <option value="Walk">Walk</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">
              School Presence ({schoolCol}2)
            </label>
            <select
              value={simSchoolStatus}
              onChange={e => setSimSchoolStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Tardy">Tardy</option>
              <option value="Excused">Excused</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">
              Evening Bus ({pmBusCol}2)
            </label>
            <select
              value={simPmStatus}
              onChange={e => setSimPmStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
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
            <label className="text-xs text-slate-300 block mb-1">
              PM Drop Time ({pmDropCol}2)
            </label>
            <input
              type="text"
              placeholder="e.g. 03:45 PM (or blank)"
              value={simPmDrop}
              onChange={e => setSimPmDrop(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Live Evaluated Output */}
        <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
              Computed Cell Value (Col M2):
            </span>
            <div className="flex items-center gap-2 mt-1">
              {simResult.type === 'critical' ? (
                <ShieldAlert className="w-5 h-5 text-red-500 animate-bounce" />
              ) : simResult.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              <span className={`font-bold text-sm sm:text-base ${
                simResult.type === 'critical' ? 'text-red-400' :
                simResult.type === 'warning' ? 'text-amber-300' :
                simResult.type === 'success' ? 'text-emerald-300' : 'text-slate-300'
              }`}>
                {simResult.result}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-400 max-w-md sm:text-right">
            {simResult.explanation}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Formula Template Cards */}
      <div className="space-y-6">
        {filteredTemplates.map(tmpl => {
          const dynamicFormula = getDynamicFormula(tmpl);
          const isCopied = copiedId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {tmpl.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      {tmpl.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {tmpl.description}
                  </p>
                </div>

                <button
                  onClick={() => copyFormula(dynamicFormula, tmpl.id)}
                  className="self-start sm:self-center px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied Formula!' : 'Copy Formula'}</span>
                </button>
              </div>

              {/* Code Box */}
              <div className="p-4 bg-slate-950 overflow-x-auto">
                <pre className="text-amber-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {dynamicFormula}
                </pre>
              </div>

              {/* Logic Breakdown */}
              <div className="p-5 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-600" />
                  <span>Formula Logic & Condition Breakdown</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {tmpl.breakdown.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-lg border border-slate-200/80 text-xs shadow-xs"
                    >
                      <code className="font-mono text-purple-700 font-semibold text-[11px] block truncate" title={item.part}>
                        {item.part}
                      </code>
                      <p className="text-slate-600 text-xs mt-1 leading-normal">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {tmpl.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Implementation Note:</span>
                    <span>{tmpl.notes}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

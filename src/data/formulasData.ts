import { FormulaTemplate } from '../types';

export const FORMULA_TEMPLATES: FormulaTemplate[] = [
  {
    id: 'unified-status-ifs',
    name: 'Unified Safety Reconciliation Formula (IFS Engine)',
    category: 'Safety Reconciliation',
    description: 'Calculates the single unified status per student by comparing Morning Bus, Classroom Presence, and Evening Bus dismissal in real-time.',
    formula: `=IFS(
  AND(G2="Boarded", I2="Absent"), "🚨 CRITICAL: Boarded Bus but Missing at School",
  AND(OR(G2="Absent", G2="Parent Transit", G2="Walk"), OR(I2="Present", I2="Tardy")), "⚠️ Transit Discrepancy: Skipped Bus but Present",
  AND(OR(I2="Present", I2="Tardy"), K2="Absent"), "⚠️ PM Attention: Present but Unaccounted for PM",
  AND(K2="Boarded Bus", L2<>""), "🟢 Safe Home Drop-Off",
  AND(OR(G2="Boarded", G2="Parent Transit", G2="Walk"), OR(I2="Present", I2="Tardy")), "🟢 Safe In Transit / Present",
  AND(OR(G2="Absent", G2="Pending"), OR(I2="Absent", I2="Excused")), "⚪ Full Absence Excused",
  TRUE, "🟡 Pending Confirmation"
)`,
    breakdown: [
      {
        part: 'AND(G2="Boarded", I2="Absent")',
        explanation: 'Detects the most critical safety failure: student got on the bus in the morning, but the classroom teacher marked them absent. Flags immediate RED alert.'
      },
      {
        part: 'AND(OR(G2="Absent", G2="Parent Transit", G2="Walk"), OR(I2="Present", I2="Tardy"))',
        explanation: 'Identifies when a student skipped their usual bus stop but arrived safely at school via private parent drop-off or carpool.'
      },
      {
        part: 'AND(OR(I2="Present", I2="Tardy"), K2="Absent")',
        explanation: 'Catches the afternoon hazard: student was present in school all day, but failed to board their assigned afternoon departure bus.'
      },
      {
        part: 'AND(K2="Boarded Bus", L2<>"")',
        explanation: 'Confirms the student completed both transit legs and disembarked with recorded evening drop timestamp.'
      },
      {
        part: 'TRUE, "🟡 Pending Confirmation"',
        explanation: 'Default fallback while morning bus routes are underway and homeroom attendance has not closed.'
      }
    ],
    notes: 'Place in cell M2 of the Daily_Transit_Attendance sheet and drag down or convert to an ARRAYFORMULA.'
  },
  {
    id: 'arrayformula-wrapper',
    name: 'Auto-Spill ARRAYFORMULA (Entire Column M with 1 Formula)',
    category: 'Safety Reconciliation',
    description: 'Place this single formula in cell M2 — it will automatically calculate unified status for every row dynamically without needing manual drag-fill.',
    formula: `=MAP(G2:G, I2:I, K2:K, L2:L, LAMBDA(g, i, k, l, 
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
))`,
    breakdown: [
      {
        part: 'MAP(G2:G, I2:I, K2:K, L2:L, LAMBDA(g, i, k, l, ...))',
        explanation: 'Iterates through columns G, I, K, and L simultaneously without slowing down Google Sheets.'
      },
      {
        part: 'IF(ISBLANK(g), "", ...)',
        explanation: 'Ensures empty rows beyond your roster remain clean blank cells without showing error messages.'
      }
    ],
    notes: 'Paste into cell M2. Ensure cells M3:M are empty so the formula can spill down freely.'
  },
  {
    id: 'discrepancy-feed-filter',
    name: 'Live Discrepancy Emergency Board (FILTER)',
    category: 'Discrepancy Reporting',
    description: 'Pulls every student with an active safety or transit mismatch onto an administrative dashboard tab for immediate action.',
    formula: `=FILTER(
  {Daily_Transit_Attendance!B2:D, Daily_Transit_Attendance!E2:E, Daily_Transit_Attendance!G2:G, Daily_Transit_Attendance!I2:I, Daily_Transit_Attendance!M2:M, Daily_Transit_Attendance!N2:N},
  REGEXMATCH(Daily_Transit_Attendance!M2:M, "🚨|⚠️")
)`,
    breakdown: [
      {
        part: 'FILTER({B2:D, E2:E, G2:G, I2:I, M2:M, N2:N}, ...)',
        explanation: 'Extracts Student ID, Name, Grade, Bus Route, AM Bus status, School status, Status text, and Parent Emergency Phone.'
      },
      {
        part: 'REGEXMATCH(Daily_Transit_Attendance!M2:M, "🚨|⚠️")',
        explanation: 'Filters only rows containing warning emojis, guaranteeing immediate visibility for transit coordinators.'
      }
    ],
    notes: 'Place in cell A4 of the Daily_Safety_Dashboard tab to create an auto-refreshing exception list.'
  },
  {
    id: 'route-capacity-countifs',
    name: 'Route Headcount & Real-Time Capacity (COUNTIFS)',
    category: 'Route Capacity',
    description: 'Calculates active morning bus ridership and compares against legal vehicle capacity.',
    formula: `=COUNTIFS(
  Daily_Transit_Attendance!$E$2:$E, $A2, 
  Daily_Transit_Attendance!$G$2:$G, "Boarded"
)`,
    breakdown: [
      {
        part: 'Daily_Transit_Attendance!$E$2:$E, $A2',
        explanation: 'Matches the Route ID (e.g. Route 101 in column A of the summary table).'
      },
      {
        part: 'Daily_Transit_Attendance!$G$2:$G, "Boarded"',
        explanation: 'Only counts students verified as physically on the bus this morning.'
      }
    ],
    notes: 'Used in the Route Summary table to verify passenger loads before the bus departs campus.'
  },
  {
    id: 'roster-autofill-xlookup',
    name: 'Instant Student Data Population (XLOOKUP)',
    category: 'Route Capacity',
    description: 'When a teacher or driver enters a Student ID in Column B, automatically populates Student Name, Grade, Route, Bus Stop, and Emergency Phone from master roster.',
    formula: `=IFERROR(
  XLOOKUP(B2, Student_Roster_Master!$A$2:$A, Student_Roster_Master!$B$2:$F), 
  ""
)`,
    breakdown: [
      {
        part: 'XLOOKUP(B2, Student_Roster_Master!$A$2:$A, ...)',
        explanation: 'Searches Master Roster for matching barcode or Student ID.'
      },
      {
        part: 'Student_Roster_Master!$B$2:$F',
        explanation: 'Multi-column return: fills Name, Grade, Route, Stop, and Guardian phone in one step.'
      },
      {
        part: 'IFERROR(..., "")',
        explanation: 'Prevents #N/A errors when student ID field is blank.'
      }
    ],
    notes: 'Place in cell C2. In modern Google Sheets, this automatically fills columns C, D, E, F, and N!'
  },
  {
    id: 'conditional-formatting-rules',
    name: 'Safety Color-Coding Conditional Formatting Formulas',
    category: 'Conditional Formatting',
    description: 'Google Sheets custom formulas to dynamically highlight entire rows based on safety state.',
    formula: `CRITICAL RED ROW (Boarded bus but missing at school):
Format rules > Custom formula is:
=AND($G2="Boarded", $I2="Absent")
(Highlight: Light Red #FCE8E6, Bold Dark Red text #C5221F)

TRANSIT MISMATCH AM (Skipped bus, present at school):
=AND(OR($G2="Absent",$G2="Parent Transit"), OR($I2="Present",$I2="Tardy"))
(Highlight: Light Yellow #FEF7E0, Text: #B06000)

SAFE HOME CONFIRMED:
=AND($K2="Boarded Bus", $L2<>"")
(Highlight: Light Green #E6F4EA, Text: #137333)`,
    breakdown: [
      {
        part: '=$G2="Boarded"',
        explanation: 'Locks column G with the "$" sign so the entire row A2:O2 receives the highlight formatting.'
      },
      {
        part: '$I2="Absent"',
        explanation: 'Verifies classroom absence in column I.'
      }
    ],
    notes: 'Apply to range A2:O1000 in Google Sheets under Format > Conditional formatting.'
  }
];

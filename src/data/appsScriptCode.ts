export const FULL_APPS_SCRIPT_CODE = `/**
 * @fileoverview School Bus & School Attendance Automated Tracker Engine
 * @description Automatically manages timestamps, safety reconciliation alerts, and daily sheet archival.
 * 
 * HOW TO INSTALL IN GOOGLE SHEETS:
 * 1. Open your Google Sheet.
 * 2. Click on "Extensions" > "Apps Script".
 * 3. Delete any code in the editor and paste this entire file.
 * 4. Update the CONFIG object below with your school administrative email.
 * 5. Click the Save icon (Ctrl+S or Cmd+S).
 * 6. Reload your Google Sheet! A new menu "🚌 Transit Tracker" will appear.
 */

const CONFIG = {
  DAILY_SHEET_NAME: 'Daily_Transit_Attendance',
  ARCHIVE_SHEET_PREFIX: 'Archive_',
  ADMIN_EMAIL: 'attendance-office@school.edu, principal@school.edu',
  COLUMNS: {
    DATE: 1,           // A
    STUDENT_ID: 2,     // B
    STUDENT_NAME: 3,   // C
    GRADE: 4,          // D
    ROUTE: 5,          // E
    STOP: 6,           // F
    AM_STATUS: 7,      // G: Morning_Bus_Status
    AM_TIME: 8,        // H: AM_Pickup_Time
    SCHOOL_STATUS: 9,  // I: School_Presence_Status
    SCHOOL_TIME: 10,   // J: School_Check_Time
    PM_STATUS: 11,     // K: Evening_Bus_Status
    PM_TIME: 12,       // L: PM_Drop_Time
    UNIFIED_STATUS: 13,// M: Unified_Safety_Status
    GUARDIAN_PHONE: 14,// N: Guardian_Emergency_Phone
    NOTES: 15          // O: Notes
  }
};

/**
 * Creates custom administrative menu upon opening the spreadsheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚌 Transit Tracker')
    .addItem('🔍 Scan for Safety Discrepancies', 'scanDiscrepanciesMenu')
    .addItem('🚨 Send Discrepancy Alert Email', 'sendDiscrepancyAlerts')
    .addSeparator()
    .addItem('📊 Refresh Dashboard Headcounts', 'refreshDashboard')
    .addItem('🔄 Reset Sheet for Tomorrow', 'resetDailySheet')
    .addSeparator()
    .addItem('📦 Archive Today to Historical Log', 'archiveTodayAttendance')
    .addToUi();
}

/**
 * Triggered automatically on cell edits.
 * Auto-populates timestamps when bus status or school presence is selected.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== CONFIG.DAILY_SHEET_NAME) return;

  const row = e.range.getRow();
  const col = e.range.getColumn();
  if (row <= 1) return; // Skip header row

  const editedValue = e.value;
  const now = new Date();
  const timeString = Utilities.formatDate(now, Session.getScriptTimeZone(), 'hh:mm a');

  // Case 1: Driver marks Morning Bus Status (Col G) as "Boarded"
  if (col === CONFIG.COLUMNS.AM_STATUS) {
    const timeCell = sheet.getRange(row, CONFIG.COLUMNS.AM_TIME);
    if (editedValue === 'Boarded' && !timeCell.getValue()) {
      timeCell.setValue(timeString);
    } else if (editedValue === 'Absent' || editedValue === 'Pending') {
      timeCell.clearContent();
    }
  }

  // Case 2: Homeroom marks School Presence Status (Col I)
  if (col === CONFIG.COLUMNS.SCHOOL_STATUS) {
    const timeCell = sheet.getRange(row, CONFIG.COLUMNS.SCHOOL_TIME);
    if ((editedValue === 'Present' || editedValue === 'Tardy') && !timeCell.getValue()) {
      timeCell.setValue(timeString);
    }
  }

  // Case 3: Driver/Staff marks Evening Bus Status (Col K) as "Boarded Bus"
  if (col === CONFIG.COLUMNS.PM_STATUS) {
    const timeCell = sheet.getRange(row, CONFIG.COLUMNS.PM_TIME);
    if (editedValue === 'Boarded Bus' && !timeCell.getValue()) {
      timeCell.setValue(timeString);
    }
  }
}

/**
 * Scans active sheet for safety discrepancies and displays an interactive dialog.
 */
function scanDiscrepanciesMenu() {
  const discrepancies = findDiscrepancies();
  const ui = SpreadsheetApp.getUi();

  if (discrepancies.length === 0) {
    ui.alert('✅ All Clear', 'No transit or classroom attendance discrepancies detected! All students are safely accounted for.', ui.ButtonSet.OK);
    return;
  }

  let message = '🚨 FOUND ' + discrepancies.length + ' ATTENDANCE DISCREPANCIES:\\n\\n';
  discrepancies.forEach(function(d, index) {
    message += (index + 1) + '. ' + d.name + ' (' + d.grade + ') - ' + d.route + '\\n';
    message += '   Issue: ' + d.type + '\\n';
    message += '   AM Bus: ' + d.amStatus + ' | School: ' + d.schoolStatus + ' | Phone: ' + d.phone + '\\n\\n';
  });

  ui.alert('Safety Alert Warning', message, ui.ButtonSet.OK);
}

/**
 * Helper function that returns array of all flagged student discrepancies.
 */
function findDiscrepancies() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.DAILY_SHEET_NAME);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const discrepancies = [];

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const studentId = row[CONFIG.COLUMNS.STUDENT_ID - 1];
    const name = row[CONFIG.COLUMNS.STUDENT_NAME - 1];
    if (!name || !studentId) continue;

    const grade = row[CONFIG.COLUMNS.GRADE - 1];
    const route = row[CONFIG.COLUMNS.ROUTE - 1];
    const amStatus = String(row[CONFIG.COLUMNS.AM_STATUS - 1] || '').trim();
    const schoolStatus = String(row[CONFIG.COLUMNS.SCHOOL_STATUS - 1] || '').trim();
    const pmStatus = String(row[CONFIG.COLUMNS.PM_STATUS - 1] || '').trim();
    const phone = row[CONFIG.COLUMNS.GUARDIAN_PHONE - 1];

    // Priority 1: Boarded bus but absent at school
    if (amStatus === 'Boarded' && schoolStatus === 'Absent') {
      discrepancies.push({
        priority: 'CRITICAL',
        type: 'Boarded Bus in Morning but Marked Absent in Classroom!',
        name: name,
        grade: grade,
        route: route,
        amStatus: amStatus,
        schoolStatus: schoolStatus,
        phone: phone,
        rowNumber: r + 1
      });
    }
    // Priority 2: Present in school but missed PM bus queue
    else if ((schoolStatus === 'Present' || schoolStatus === 'Tardy') && pmStatus === 'Absent') {
      discrepancies.push({
        priority: 'WARNING',
        type: 'Present in School but Absent from Evening Bus Departure Bay',
        name: name,
        grade: grade,
        route: route,
        amStatus: amStatus,
        schoolStatus: schoolStatus,
        phone: phone,
        rowNumber: r + 1
      });
    }
  }

  return discrepancies;
}

/**
 * Sends urgent HTML email to school administrative team if critical discrepancies exist.
 * Can be scheduled as a Time-Driven Trigger at 9:15 AM every weekday!
 */
function sendDiscrepancyAlerts() {
  const discrepancies = findDiscrepancies();
  if (discrepancies.length === 0) {
    Logger.log('No discrepancies to email.');
    return;
  }

  const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM dd, yyyy');
  const subject = '🚨 URGENT: ' + discrepancies.length + ' Student Transit Discrepancies - ' + todayStr;

  let htmlBody = '<h2 style="color: #b91c1c;">⚠️ School Bus Transit & Classroom Attendance Discrepancies</h2>';
  htmlBody += '<p>The automated safety system detected the following student reconciliation flags on <strong>' + todayStr + '</strong>:</p>';
  htmlBody += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: sans-serif; font-size: 13px; width: 100%;">';
  htmlBody += '<tr style="background-color: #fee2e2; color: #991b1b;"><th>Student Name</th><th>Grade</th><th>Bus Route</th><th>Discrepancy Issue</th><th>AM Bus</th><th>School Gate</th><th>Guardian Contact</th></tr>';

  discrepancies.forEach(function(d) {
    htmlBody += '<tr>';
    htmlBody += '<td><strong>' + d.name + '</strong></td>';
    htmlBody += '<td>' + d.grade + '</td>';
    htmlBody += '<td>' + d.route + '</td>';
    htmlBody += '<td style="color: #b91c1c; font-weight: bold;">' + d.type + '</td>';
    htmlBody += '<td>' + d.amStatus + '</td>';
    htmlBody += '<td>' + d.schoolStatus + '</td>';
    htmlBody += '<td><a href="tel:' + d.phone + '">' + d.phone + '</a></td>';
    htmlBody += '</tr>';
  });

  htmlBody += '</table>';
  htmlBody += '<p style="margin-top: 16px; color: #666;">Generated automatically by School Bus & Transit Attendance Hub.</p>';

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });

  SpreadsheetApp.getActiveSpreadsheet().toast('Alert email successfully sent to ' + CONFIG.ADMIN_EMAIL, 'Discrepancy Alert Sent', 5);
}

/**
 * Archives current day data into a historical sheet and clears statuses for next school day.
 */
function archiveTodayAttendance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName(CONFIG.DAILY_SHEET_NAME);
  if (!sourceSheet) return;

  const dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy_MM_dd');
  const archiveName = CONFIG.ARCHIVE_SHEET_PREFIX + dateStr;

  // Check if archive sheet exists, if not create
  let archiveSheet = ss.getSheetByName(archiveName);
  if (!archiveSheet) {
    archiveSheet = sourceSheet.copyTo(ss);
    archiveSheet.setName(archiveName);
    SpreadsheetApp.getActiveSpreadsheet().toast('Archived successfully to ' + archiveName, 'Archived', 4);
  }
}

/**
 * Prepares the sheet for the next school day by resetting attendance choices while keeping roster.
 */
function resetDailySheet() {
  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    'Reset Daily Check-Sheet',
    'Are you sure you want to reset attendance for tomorrow? Make sure today has been archived first.',
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.DAILY_SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  // Set Tomorrow's Date in Col A
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = Utilities.formatDate(tomorrow, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  sheet.getRange(2, CONFIG.COLUMNS.DATE, lastRow - 1, 1).setValue(tomorrowStr);

  // Clear AM Status (G), AM Time (H), School Status (I), School Time (J), PM Status (K), PM Time (L), Notes (O)
  sheet.getRange(2, CONFIG.COLUMNS.AM_STATUS, lastRow - 1, 1).setValue('Pending');
  sheet.getRange(2, CONFIG.COLUMNS.AM_TIME, lastRow - 1, 1).clearContent();
  sheet.getRange(2, CONFIG.COLUMNS.SCHOOL_STATUS, lastRow - 1, 1).setValue('Pending');
  sheet.getRange(2, CONFIG.COLUMNS.SCHOOL_TIME, lastRow - 1, 1).clearContent();
  sheet.getRange(2, CONFIG.COLUMNS.PM_STATUS, lastRow - 1, 1).setValue('Pending');
  sheet.getRange(2, CONFIG.COLUMNS.PM_TIME, lastRow - 1, 1).clearContent();
  sheet.getRange(2, CONFIG.COLUMNS.NOTES, lastRow - 1, 1).clearContent();

  sheet.toast('Sheet cleared and primed for ' + tomorrowStr, 'Reset Complete', 5);
}
`;

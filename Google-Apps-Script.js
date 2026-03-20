// ═══════════════════════════════════════════════════════════
//  CRIMELENS — Google Apps Script
//  Paste this in Google Apps Script and deploy as Web App
// ═══════════════════════════════════════════════════════════
//
//  SETUP STEPS:
//  1. Open Google Sheets → Extensions → Apps Script
//  2. Paste this entire code replacing the default code
//  3. Click "Save" (Ctrl+S)
//  4. Click "Deploy" → "New Deployment"
//  5. Type: Web App
//  6. Execute as: Me
//  7. Who has access: Anyone
//  8. Click "Deploy" and copy the Web App URL
//  9. Paste that URL in app.js as GOOGLE_SCRIPT_URL
// ═══════════════════════════════════════════════════════════

const SHEET_NAME = 'CrimeReports';

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Report ID',
        'Email',
        'Crime Type',
        'Location / Area',
        'Date & Time',
        'Severity',
        'Description',
        'Submitted At'
      ]);
      // Style header row
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground('#e63946');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }

    // Generate Report ID
    const reportId = 'CL-' + new Date().getTime().toString(36).toUpperCase();

    // Append the new row
    sheet.appendRow([
      new Date().toISOString(),
      reportId,
      data.email || '',
      data.crimeType || '',
      data.location || '',
      data.datetime || '',
      data.severity || 'Medium',
      data.description || '',
      data.timestamp || new Date().toISOString()
    ]);

    // Auto-resize columns
    sheet.autoResizeColumns(1, 9);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, reportId: reportId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'CrimeLens API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

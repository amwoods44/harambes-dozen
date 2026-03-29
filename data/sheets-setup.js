// ═══ Harambe's Dozen — Contract Sheet Formatter ═══
// Run this in Google Sheets: Extensions → Apps Script → paste → Run
// Formats the entire sheet: headers, colors, protection, dropdowns, conditional formatting

function formatContractSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename("Harambe's Dozen — Contracts");

  // ── Tab 1: Contracts ──
  let sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];
  sheet.setName('Contracts');

  const lastRow = sheet.getLastRow();
  const lastCol = 9; // A through I

  // Freeze header row
  sheet.setFrozenRows(1);

  // ── Column widths ──
  sheet.setColumnWidth(1, 180); // Player Name
  sheet.setColumnWidth(2, 50);  // POS
  sheet.setColumnWidth(3, 60);  // NFL Team
  sheet.setColumnWidth(4, 160); // Fantasy Team
  sheet.setColumnWidth(5, 10);  // Sleeper ID (hidden)
  sheet.setColumnWidth(6, 130); // Contract Years
  sheet.setColumnWidth(7, 120); // Tag Status
  sheet.setColumnWidth(8, 140); // Exemption
  sheet.setColumnWidth(9, 200); // Notes

  // Hide Sleeper ID column (E)
  sheet.hideColumns(5);

  // ── Header formatting ──
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setBackground('#1a1a2e')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);

  // Rename headers with edit indicators
  sheet.getRange('F1').setValue('✏️ Contract Years');
  sheet.getRange('G1').setValue('✏️ Tag Status');
  sheet.getRange('H1').setValue('✏️ Exemption');
  sheet.getRange('I1').setValue('✏️ Notes');

  // ── Locked columns (A-E): gray background ──
  if (lastRow > 1) {
    const lockedRange = sheet.getRange(2, 1, lastRow - 1, 5);
    lockedRange.setBackground('#f0f0f0')
      .setFontColor('#333333')
      .setFontStyle('italic')
      .setFontFamily('Arial')
      .setFontSize(10);
  }

  // ── Editable columns (F-I): white background, slightly larger ──
  if (lastRow > 1) {
    const editRange = sheet.getRange(2, 6, lastRow - 1, 4);
    editRange.setBackground('#ffffff')
      .setFontColor('#111111')
      .setFontFamily('Arial')
      .setFontSize(10)
      .setHorizontalAlignment('center');
    // Notes column left-aligned
    sheet.getRange(2, 9, lastRow - 1, 1).setHorizontalAlignment('left');
  }

  // ── Thick border between locked and editable (column E/F boundary) ──
  const borderRange = sheet.getRange(1, 5, lastRow, 1);
  borderRange.setBorder(null, null, null, true, null, null, '#10B981', SpreadsheetApp.BorderStyle.SOLID_THICK);

  // ── Position color coding (column B) ──
  const posColors = {
    'QB': '#fecaca',  // red-100
    'RB': '#bfdbfe',  // blue-100
    'WR': '#bbf7d0',  // green-100
    'TE': '#fef08a',  // yellow-100
    'DEF': '#e9d5ff'  // purple-100
  };
  const posFontColors = {
    'QB': '#dc2626',
    'RB': '#2563eb',
    'WR': '#16a34a',
    'TE': '#ca8a04',
    'DEF': '#7c3aed'
  };

  if (lastRow > 1) {
    const posData = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (let i = 0; i < posData.length; i++) {
      const pos = posData[i][0];
      if (posColors[pos]) {
        const cell = sheet.getRange(i + 2, 2);
        cell.setBackground(posColors[pos])
          .setFontColor(posFontColors[pos])
          .setFontWeight('bold')
          .setFontStyle('normal')
          .setHorizontalAlignment('center');
      }
    }
  }

  // ── Data validation dropdowns ──
  if (lastRow > 1) {
    // Contract Years: 1-6 (blank = uncontracted, not on a deal yet)
    const yrsRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['', '1', '2', '3', '4', '5', '6'], true)
      .setAllowInvalid(false)
      .setHelpText('Leave blank if player has no contract. 1-6 = years remaining.')
      .build();
    sheet.getRange(2, 6, lastRow - 1, 1).setDataValidation(yrsRule);

    // Tag Status: None, Franchise, Transition (app also accepts "true" as Franchise)
    const tagRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['None', 'Franchise', 'Transition'], true)
      .setAllowInvalid(false)
      .setHelpText('Franchise or Transition tag. None = no tag.')
      .build();
    sheet.getRange(2, 7, lastRow - 1, 1).setDataValidation(tagRule);

    // Exemption: None, or the year the exemption was used (e.g. "2025")
    const currentYear = new Date().getFullYear();
    const exYears = ['None'];
    for (let y = currentYear; y >= 2023; y--) exYears.push(String(y));
    const exRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(exYears, true)
      .setAllowInvalid(false)
      .setHelpText('Year the exemption was used on this player. None = no exemption.')
      .build();
    sheet.getRange(2, 8, lastRow - 1, 1).setDataValidation(exRule);
  }

  // ── Conditional formatting ──
  const rules = sheet.getConditionalFormatRules();

  // Contract Years = 1 → amber row highlight
  if (lastRow > 1) {
    const amberRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('1')
      .setBackground('#fef3c7')
      .setRanges([sheet.getRange(2, 6, lastRow - 1, 1)])
      .build();
    rules.push(amberRule);

    // Tag != None → red accent
    const tagRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextDoesNotContain('None')
      .setBackground('#fee2e2')
      .setFontColor('#dc2626')
      .setRanges([sheet.getRange(2, 7, lastRow - 1, 1)])
      .build();
    rules.push(tagRule);

    // Exemption != None → purple accent
    const exRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextDoesNotContain('None')
      .setBackground('#f3e8ff')
      .setFontColor('#7c3aed')
      .setRanges([sheet.getRange(2, 8, lastRow - 1, 1)])
      .build();
    rules.push(exRule);
  }

  sheet.setConditionalFormatRules(rules);

  // ── Alternating colors per team section ──
  if (lastRow > 1) {
    const teamData = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
    let currentTeam = '';
    let teamIdx = 0;
    for (let i = 0; i < teamData.length; i++) {
      if (teamData[i][0] !== currentTeam) {
        currentTeam = teamData[i][0];
        teamIdx++;
      }
      if (teamIdx % 2 === 0) {
        // Light stripe for alternating teams
        const row = sheet.getRange(i + 2, 1, 1, 5);
        row.setBackground('#f5f5f5');
      }
    }
  }

  // ── Protect locked columns (A-E) ──
  const protection = sheet.protect().setDescription('Locked columns — do not edit');
  const unprotected = [
    sheet.getRange(2, 6, Math.max(lastRow - 1, 1), 1),  // Contract Years
    sheet.getRange(2, 7, Math.max(lastRow - 1, 1), 1),  // Tag Status
    sheet.getRange(2, 8, Math.max(lastRow - 1, 1), 1),  // Exemption
    sheet.getRange(2, 9, Math.max(lastRow - 1, 1), 1),  // Notes
  ];
  protection.setUnprotectedRanges(unprotected);
  protection.setWarningOnly(true); // Warn instead of block (so commissioner can still add rows)

  // ── Tab 2: Instructions ──
  let instrSheet = ss.getSheetByName('Instructions');
  if (!instrSheet) instrSheet = ss.insertSheet('Instructions');
  instrSheet.clear();
  instrSheet.setColumnWidth(1, 700);

  const instructions = [
    ['HARAMBE\'S DOZEN — CONTRACT SHEET GUIDE'],
    [''],
    ['HOW THIS WORKS'],
    ['This sheet is the single source of truth for dynasty contracts.'],
    ['The league app reads this sheet automatically on every page load.'],
    ['When you make a change here, reload the app to see it.'],
    [''],
    ['WHAT TO EDIT (white columns with ✏️ headers)'],
    ['• Contract Years — How many years remain (1-6). Leave blank if uncontracted.'],
    ['• Tag Status — Franchise, Transition, or None. Use the dropdown.'],
    ['• Exemption — The year the exemption was used (e.g. 2025), or None.'],
    ['• Notes — Free text. Anything you want to remember.'],
    [''],
    ['WHAT NOT TO TOUCH (gray columns)'],
    ['• Player Name, POS, NFL Team, Fantasy Team — these come from Sleeper.'],
    ['• The gray columns are protected. Don\'t edit them.'],
    [''],
    ['FAQ'],
    [''],
    ['Q: A player got traded. What do I do?'],
    ['A: Nothing — the app matches players by Sleeper ID, not by team.'],
    ['   The "Fantasy Team" column may be outdated but the app ignores it.'],
    [''],
    ['Q: A new player was drafted or picked up. How do I add them?'],
    ['A: Add a new row at the bottom. Fill in the player name and contract info.'],
    ['   The app will match by name. Sleeper ID is optional but helps.'],
    [''],
    ['Q: I made a mistake. Can I undo?'],
    ['A: Yes — just change the cell. Or use Cmd+Z to undo.'],
    ['   Changes are reflected in the app on the next page reload.'],
    [''],
    ['Q: What if I accidentally edit a gray column?'],
    ['A: You\'ll get a warning. Use Cmd+Z to undo.'],
    ['   It won\'t break anything but the app ignores those columns.'],
  ];

  instrSheet.getRange(1, 1, instructions.length, 1).setValues(instructions);
  instrSheet.getRange(1, 1).setFontSize(16).setFontWeight('bold').setFontFamily('Arial');
  instrSheet.getRange(3, 1).setFontSize(12).setFontWeight('bold');
  instrSheet.getRange(8, 1).setFontSize(12).setFontWeight('bold');
  instrSheet.getRange(14, 1).setFontSize(12).setFontWeight('bold');
  instrSheet.getRange(18, 1).setFontSize(12).setFontWeight('bold');

  // ── Tab 3: Exemption History ──
  let exSheet = ss.getSheetByName('Exemption History');
  if (!exSheet) exSheet = ss.insertSheet('Exemption History');
  exSheet.clear();

  const exHeaders = [['Season', 'Player Name', 'Fantasy Team', 'Exemption Type', 'Notes']];
  exSheet.getRange(1, 1, 1, 5).setValues(exHeaders)
    .setBackground('#1a1a2e')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontFamily('Arial');
  exSheet.setFrozenRows(1);
  exSheet.setColumnWidth(1, 80);
  exSheet.setColumnWidth(2, 180);
  exSheet.setColumnWidth(3, 160);
  exSheet.setColumnWidth(4, 140);
  exSheet.setColumnWidth(5, 250);

  SpreadsheetApp.flush();
  Logger.log('✅ Sheet formatted successfully! ' + (lastRow - 1) + ' players across 3 tabs.');
}

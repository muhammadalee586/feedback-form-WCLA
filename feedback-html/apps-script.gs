// Google Apps Script: receives the feedback form and appends a row to the sheet.
var HEADERS = ['Received','Ref','Type','Place','Visit date','Visitor','Group','Overall','Cleanliness','Staff','Signs','Accessibility','Safety','Value','Tags','Message','Anonymous','Name','Email','Phone','City','Reply wanted','Photos'];

function doPost(e) {
  var p = e.parameter;
  if (p.website) return ContentService.createTextOutput('ok'); // honeypot hit: ignore bots
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.appendRow([new Date(), p.ref, p.type, p.place, p.date, p.visitor, p.group, p.overall, p.clean, p.staff, p.sign, p.access, p.safe, p.value, p.tags, p.message, p.anonymous, p.name, p.email, p.phone, p.city, p.reply_requested, p.photos]);
  return ContentService.createTextOutput('ok');
}

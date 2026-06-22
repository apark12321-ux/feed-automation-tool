const SHEET_NAME = 'FeedQueue';
const RSS_FEEDS = ['PASTE_GOOGLE_ALERTS_RSS_URL_HERE'];

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Status','Title','Body','Tags','SourceUrl','PublishedAt','ScheduledAt']);
  }
}

function collectRssToFeedQueue() {
  setupSheet();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const existing = new Set(sheet.getDataRange().getValues().slice(1).map(row => row[4]));
  const rows = [];
  RSS_FEEDS.forEach(feedUrl => {
    const xmlText = UrlFetchApp.fetch(feedUrl, { muteHttpExceptions: true }).getContentText();
    const doc = XmlService.parse(xmlText);
    const root = doc.getRootElement();
    const ns = root.getNamespace();
    root.getChildren('entry', ns).forEach(entry => {
      const title = cleanText(entry.getChildText('title', ns));
      const body = cleanText(entry.getChildText('content', ns));
      const linkNode = entry.getChild('link', ns);
      const sourceUrl = linkNode ? linkNode.getAttribute('href').getValue() : '';
      if (!sourceUrl || existing.has(sourceUrl)) return;
      rows.push(['Ready', title, body, makeTags(title), sourceUrl, new Date(), nextSchedule()]);
    });
  });
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function cleanText(value) {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

function makeTags(title) {
  return cleanText(title).split(/\s+/).slice(0, 5).join(',');
}

function nextSchedule() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(20, 0, 0, 0);
  return d;
}

function createDailyTrigger() {
  ScriptApp.newTrigger('collectRssToFeedQueue').timeBased().everyDays(1).atHour(19).create();
}

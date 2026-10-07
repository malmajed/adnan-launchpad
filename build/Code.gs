// Adnan's Launchpad — Google Sheet backend (v5: single learner + advisor channel)
// SECRET: Adnan's app and the Advisor view both use it to read and to save Adnan's progress.
// ADVISOR_KEY: only the Advisor view has it; it is required to write notes, tasks and focus.
const SECRET = 'CHANGE-ME';
const ADVISOR_KEY = 'CHANGE-ME-TOO';
const PHOTO_FOLDER = 'Adnan Launchpad Photos';
const CHUNK = 40000; // Sheets cell limit is 50,000 characters

function doGet(e) {
  if (!e.parameter || e.parameter.key !== SECRET) return out({ error: 'bad key' });
  return out({ state: readBlob('state'), advisor: readBlob('advisor') });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out({ error: 'bad json' }); }
  if (body.key !== SECRET) return out({ error: 'bad key' });

  // --- advisor channel: notes, tasks, focus path
  if (body.advisor) {
    if (body.akey !== ADVISOR_KEY) return out({ error: 'advisor key required' });
    writeBlob('advisor', body.advisor);
    logRows([[new Date(), 'advisor', 'notes', (body.advisor.notes || []).length + ' items']]);
    return out({ ok: true });
  }

  // --- photo upload from the build notebook
  if (body.photo) {
    const m = body.photo.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!m) return out({ error: 'bad image' });
    const name = Utilities.formatDate(new Date(), 'Asia/Riyadh', 'yyyy-MM-dd HH-mm') + ' ' + (body.name || body.mission || 'photo') + '.jpg';
    const file = getFolder().createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    logRows([[new Date(), 'photo', body.mission || '', file.getUrl()]]);
    return out({ ok: true, url: file.getUrl(), id: file.getId() });
  }

  // --- Adnan's progress state
  const st = body.state || {};
  writeBlob('state', st, body.device);
  const props = PropertiesService.getScriptProperties();
  const last = Number(props.getProperty('last_log') || 0);
  const fresh = (st.log || []).filter(x => x.t > last);
  if (fresh.length) {
    logRows(fresh.map(x => [new Date(x.t), x.type, x.mod, x.detail || '']));
    props.setProperty('last_log', String(Math.max.apply(null, fresh.map(x => x.t))));
  }
  writeReadable(st);
  return out({ ok: true });
}

// ---- human-readable tabs, rebuilt on every save (the app is the source of truth)
function writeReadable(st) {
  table('summary', ['Mission', 'Status', 'Best score %', 'Attempts', 'XP', 'Time (min)', 'Last activity'],
    Object.keys(st.progress || {}).map(id => { const p = st.progress[id]; return [id, p.status, Math.round((p.best || 0) * 100), p.attempts || 0, p.xp || 0, Math.round(((st.time || {})[id] || 0) / 60), p.updated ? new Date(p.updated) : '']; }));
  table('pipeline', ['Company', 'Role', 'Sector', 'Path', 'Stage', 'Applied', 'Next step', 'Notes', 'Updated'],
    (st.apps || []).map(a => [a.co, a.role || '', a.sector || '', a.path || '', a.stage, a.applied ? new Date(a.applied) : '', a.next || '', a.notes || '', a.updated ? new Date(a.updated) : '']));
  table('network', ['Name', 'Role', 'Via', 'Path', 'Status', 'Learned'],
    (st.contacts || []).map(c => [c.n, c.r || '', c.via || '', c.path || '', c.status, c.learned || '']));
  table('checkins', ['Week of', 'Momentum (1-5)', 'Hours', 'Wins', 'Blockers', 'Asked for help with', 'Submitted'],
    Object.keys(st.checkins || {}).sort().reverse().map(k => { const c = st.checkins[k]; return [k, c.energy, c.hours || 0, c.wins || '', c.blockers || '', c.ask || '', c.t ? new Date(c.t) : '']; }));
  const c = st.compass;
  if (c && c.hist && c.hist.length) table('compass', ['Date', 'Path 1', 'Fit', 'Path 2', 'Fit', 'Path 3', 'Fit'],
    c.hist.slice().reverse().map(h => [new Date(h.t)].concat([].concat.apply([], h.top))));
}
function table(name, head, rows) {
  const sh = sheet(name); sh.clear();
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  if (rows.length) sh.getRange(2, 1, rows.length, head.length).setValues(rows.map(r => head.map((_, i) => r[i] === undefined ? '' : r[i])));
}
function logRows(rows) {
  const log = sheet('activity');
  if (log.getLastRow() === 0) log.appendRow(['Time', 'Type', 'Item', 'Detail']);
  log.getRange(log.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
}

// ---- JSON blobs stored as chunks down column A
function writeBlob(name, obj, device) {
  const sh = sheet(name); const s = JSON.stringify(obj); const parts = [];
  for (let i = 0; i < s.length; i += CHUNK) parts.push([s.slice(i, i + CHUNK)]);
  sh.clear(); sh.getRange(1, 1, parts.length, 1).setValues(parts);
  sh.getRange('B1').setValue(new Date()); sh.getRange('C1').setValue(device || '');
}
function readBlob(name) {
  const sh = sheet(name); const n = sh.getLastRow(); if (!n) return null;
  const v = sh.getRange(1, 1, n, 1).getValues().map(r => r[0]).join('');
  try { return v ? JSON.parse(v) : null; } catch (e) { return null; }
}

// ---- optional weekly digest to the advisor. Run setupWeeklyDigest() ONCE from the editor only if wanted.
function setupWeeklyDigest() {
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'weeklyDigest') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('weeklyDigest').timeBased().onWeekDay(ScriptApp.WeekDay.THURSDAY).atHour(18).inTimezone('Asia/Riyadh').create();
  weeklyDigest();
}
function weeklyDigest() {
  const st = readBlob('state') || {}; const week = Date.now() - 7 * 864e5;
  const log = (st.log || []).filter(x => x.t > week);
  const ks = Object.keys(st.checkins || {}).sort(); const ck = ks.length ? st.checkins[ks[ks.length - 1]] : null;
  const apps = st.apps || [];
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px"><h2 style="color:#0B1F3A;border-bottom:3px solid #17A897;padding-bottom:6px">Adnan — weekly digest</h2>
   <p><b>Active days:</b> ${new Set(log.map(x => new Date(x.t).toDateString())).size} of 7 · <b>Missions completed this week:</b> ${log.filter(x => x.type === 'complete').length}</p>
   <p><b>Latest check-in:</b> ${ck ? 'momentum ' + ck.energy + '/5, ' + (ck.hours || 0) + ' h. Wins: ' + (ck.wins || '—') + '. Blockers: ' + (ck.blockers || '—') + '. Asked for: ' + (ck.ask || '—') : 'none'}</p>
   <p><b>Pipeline:</b> ${apps.filter(a => a.applied).length} applications sent, ${apps.filter(a => a.stage === 'Interview').length} at interview, ${apps.filter(a => a.stage === 'Offer').length} offers.</p>
   <p style="color:#888">Open the Advisor view for detail.</p></div>`;
  MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: 'Adnan — weekly digest', htmlBody: html });
}

function getFolder() { const it = DriveApp.getFoldersByName(PHOTO_FOLDER); return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER); }
function sheet(name) { const ss = SpreadsheetApp.getActiveSpreadsheet(); return ss.getSheetByName(name) || ss.insertSheet(name); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

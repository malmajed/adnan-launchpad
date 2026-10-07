// End-to-end test: Adnan app + Advisor view against the mock backend.
// Run: (cd repo && python3 -m http.server 8765 &) ; node build/test/mock.js & ; node build/test/e2e.js <outdir>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '/tmp';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64');
(async () => {
  const br = await chromium.launch();
  const errs = [];
  const mk = async () => { const c = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); return p; };
  const p = await mk();
  await p.goto('http://localhost:8765/index.html#sync=' + b64({ u: 'http://localhost:8767', k: 'test' }));
  await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + '/01-welcome.png' });
  await p.click('#wgo'); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/02-compass-intro.png' });
  await p.click('text=Start Compass');
  // interests: deterministic pattern favouring perception/embedded
  const ints = [3, 4, 4, 5, 4, 3, 3, 4, 3, 5, 5, 3, 2, 2, 2, 4, 3, 4, 4, 5];
  for (let i = 0; i < ints.length; i++) await p.click(`[data-k="i${i}"][data-v="${ints[i]}"]`);
  await p.screenshot({ path: OUT + '/03-interests.png' });
  await p.click('#cnext');
  for (const [i, v] of [[0, 1], [1, 0], [2, 0], [3, 1], [4, 0], [5, 1]]) await p.click(`[data-k="s${i}"][data-v="${v}"]`);
  await p.click('#cnext');
  for (const [i, v] of [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1], [5, 1], [6, 0]]) await p.click(`[data-k="v${i}"][data-v="${v}"]`);
  await p.click('#cnext');
  const sk = { cpp: 3, py: 3, mcu: 3, pcb: 2, analog: 2, dsp: 2, ctrl: 2, hdl: 1, net: 2, ml: 1, linux: 1, comm: 3, jp: 2 };
  for (const k in sk) await p.click(`[data-k="k_${k}"][data-v="${sk[k]}"]`);
  await p.click('#cnext');
  const ts = await p.$$('[data-o]');
  for (const t of ts) await t.fill('Building the touchless terminal: getting the LiDAR zones to stream cleanly and seeing gestures work.');
  await p.click('#cfin'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/04-results.png', fullPage: true });
  // pulse
  await p.goto('http://localhost:8765/index.html#/pulse'); await p.waitForTimeout(300);
  await p.click('#en button[data-n="4"]'); await p.fill('#hrs', '6'); await p.fill('#win', 'Finished Compass'); await p.fill('#blk', 'Not sure how to reach people at defence firms'); await p.fill('#ask', 'An introduction to someone in UAV perception');
  await p.click('#psv'); await p.waitForTimeout(300);
  // mission l01: learn, lab, test
  await p.goto('http://localhost:8765/index.html#/m/l01'); await p.waitForTimeout(300);
  for (let i = 0; i < 4; i++) await p.click('#nxt');
  await p.click('#fin'); await p.waitForTimeout(300);
  const cos = [[0, 'SAMI Advanced Electronics'], [0, 'Defence integrator X'], [1, 'UAV maker Y'], [1, 'Avionics Z'], [2, 'Ceer'], [2, 'Lucid'], [4, 'stc'], [6, 'Yokogawa Saudi'], [8, 'Japanese OEM Q']];
  for (const [i, co] of cos) { await p.fill(`[data-mk="${i}"]`, co); await p.click(`[data-ma="${i}"]`); }
  await p.screenshot({ path: OUT + '/05-market-lab.png' });
  await p.goto('http://localhost:8765/index.html#/m/l01/test'); await p.waitForTimeout(200);
  for (let i = 0; i < 6; i++) { await p.click('.qopt >> nth=0'); await p.click('#nq'); }
  // CV workbench
  await p.goto('http://localhost:8765/index.html#/m/l03/lab'); await p.waitForTimeout(300);
  await p.fill('[data-cv="0"]', 'Characterised thermal and power behaviour of 12 LiDAR units from 25 to 60 °C and proposed a chassis revision.');
  await p.click('#cvs'); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/06-cv-lab.png' });
  await p.goto('http://localhost:8765/index.html#/home'); await p.waitForTimeout(1800);
  await p.screenshot({ path: OUT + '/07-home.png', fullPage: true });

  // advisor
  const a = await mk();
  await a.goto('http://localhost:8765/follow.html#sync=' + b64({ u: 'http://localhost:8767', k: 'test', a: 'adv' }));
  await a.waitForTimeout(1500);
  await a.screenshot({ path: OUT + '/08-advisor-brief.png', fullPage: true });
  await a.click('[data-at="compass"]'); await a.waitForTimeout(200);
  await a.screenshot({ path: OUT + '/09-advisor-compass.png', fullPage: true });
  await a.click('[data-at="guide"]'); await a.waitForTimeout(200);
  await a.fill('#ntxt', 'Good start, Adnan. I will introduce you to a UAV perception lead next week.');
  await a.click('#nsend'); await a.waitForTimeout(600);
  await a.click('[data-kd="task"]'); await a.fill('#ntxt', 'Rewrite all six CV bullets before Sunday.'); await a.selectOption('#nm', 'l03'); await a.click('#nsend'); await a.waitForTimeout(600);
  await a.screenshot({ path: OUT + '/10-advisor-guide.png', fullPage: true });

  // Adnan receives
  await p.goto('http://localhost:8765/index.html#/home'); await p.reload(); await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + '/11-home-with-note.png' });
  await p.goto('http://localhost:8765/index.html#/inbox'); await p.waitForTimeout(300);
  const rp = await p.$$('[data-rp]'); await rp[0].fill('Will do. Thank you!'); await (await p.$$('[data-rs]'))[0].click();
  await p.click('[data-dn]'); await p.waitForTimeout(1800);
  await a.reload(); await a.waitForTimeout(1500);
  const brief = await a.textContent('#abox');
  await a.click('[data-at="history"]'); await a.waitForTimeout(300);
  const hist = await a.textContent('#abox'); console.log('history has reply+done+read:', hist.includes('Adnan replied') && hist.includes('Marked done') && hist.includes('Read by Adnan'));
  await a.click('[data-at="guide"]'); await a.waitForTimeout(200); await a.click('[data-narc]'); await a.click('[data-narc]'); await a.waitForTimeout(1500);
  await a.click('[data-at="history"]'); await a.waitForTimeout(300); console.log('archived kept in history:', (await a.textContent('#abox')).includes('Archived'));
  await a.screenshot({ path: OUT + '/12-history.png', fullPage: true });
  console.log('advisor sees reply:', brief.includes('Will do'), '| flags/moves present:', brief.includes('He asked for help'));
  const st = await p.evaluate(() => ({ xp: state.xp, apps: state.apps.length, compass: !!state.compass.done, top: compassScore(state.compass).rank.slice(0, 3), done: Object.keys(state.progress).filter(k => state.progress[k].status === 'completed') }));
  console.log(JSON.stringify(st));
  console.log('errors:', errs.length ? errs : 'none');
  await br.close();
})();

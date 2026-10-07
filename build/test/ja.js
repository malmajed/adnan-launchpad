// Japanese-mode test: switch language, visit key screens, check EN reveal, no escaped ruby, no errors.
const { chromium } = require('playwright');
const OUT = process.argv[2] || '/tmp';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64');
(async () => {
  const br = await chromium.launch(); const errs = [];
  const c = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await c.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto('http://localhost:8765/index.html#sync=' + b64({ u: 'http://localhost:8767', k: 'test' })); await p.waitForTimeout(1200);
  if (await p.$('#wgo')) { await p.click('#wgo'); await p.waitForTimeout(300) }
  if (!(await p.evaluate(() => JAON()))) { await p.click('#langBtn'); await p.waitForTimeout(1500) }
  const shot = async (h, f, full) => { await p.goto('http://localhost:8765/index.html#' + h); await p.waitForTimeout(700); await p.screenshot({ path: OUT + '/' + f, fullPage: !!full }); const tx = (await p.innerText('#view'))+(await p.innerText('#tabs')); if (tx.includes('<ruby') || tx.includes('<rt>')) errs.push('escaped ruby on ' + h); return tx };
  await shot('/home', 'ja-01-home.png');
  await shot('/compass', 'ja-02-compass.png', true);
  await shot('/compass/int', 'ja-03-interests.png');
  await p.goto('http://localhost:8765/index.html#/m/l03/learn'); await p.waitForTimeout(600);
  await p.click('details.enx summary'); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/ja-04-learn-en.png' });
  await shot('/m/l05/test', 'ja-05-test.png');
  await shot('/m/l03/lab', 'ja-06-cvlab.png');
  await shot('/tracks', 'ja-07-tracks.png', true);
  await shot('/pulse', 'ja-08-pulse.png');
  await shot('/settings', 'ja-09-settings.png');
  const st = await p.evaluate(() => ({ lang: state.settings.lang, title: M.l01.title, log: state.log.slice(-3).map(l => l.detail) }));
  console.log(JSON.stringify(st));
  // advisor stays English
  const a = await c.newPage(); await a.goto('http://localhost:8765/follow.html#sync=' + b64({ u: 'http://localhost:8767', k: 'test', a: 'adv' })); await a.waitForTimeout(1500);
  const at = await a.textContent('#view'); console.log('advisor English:', at.includes('Where Adnan is'), 'no JA:', !/[぀-ヿ]/.test(at.replace(/日本語/g, '')));
  console.log('errors:', errs.length ? errs : 'none'); await br.close();
})();

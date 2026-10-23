// Rise at Legrand: every mission renders all steps, every lab completes or renders, advisor shows wins.
const { chromium } = require('playwright');
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64');
(async () => {
  const br = await chromium.launch(); const c = await br.newContext({ viewport: { width: 390, height: 844 } }); const p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto('http://localhost:8765/index.html#sync=' + b64({ u: 'http://localhost:8767', k: 'test' })); await p.waitForTimeout(1500);
  if (await p.$('#wgo')) { await p.click('#wgo'); await p.waitForTimeout(300) }
  for (let i = 1; i <= 10; i++) { const id = 'j' + String(i).padStart(2, '0');
    for (const st of ['learn', 'lab', 'test', 'reflect', 'read']) { await p.goto(`http://localhost:8765/index.html#/m/${id}/${st}`); await p.waitForTimeout(150); const t = await p.innerText('#stepBox'); if (t.length < 30) errs.push(id + ' ' + st + ' empty') } }
  // wins lab
  await p.goto('http://localhost:8765/index.html#/m/j09/lab'); await p.waitForTimeout(300);
  for (const w of ['Built Arteor comparison sheet for sales', 'Trained 20 installers at a distributor', 'Learned the Netatmo range in depth']) { await p.fill('#ww', w); await p.fill('#wr', 'Used by sales team'); await p.click('#wadd'); await p.waitForTimeout(150) }
  // datacenter calc challenge
  await p.goto('http://localhost:8765/index.html#/m/j08/lab'); await p.waitForTimeout(300); await p.fill('#k_red', '2'); await p.fill('#kask', '711'); await p.click('#kchk'); await p.waitForTimeout(200);
  const st = await p.evaluate(() => ({ wins: state.wins.length, j09: P('j09').steps.lab ? 1 : 0, j08: P('j08').steps.lab ? 1 : 0, next: nextMission() }));
  await p.goto('http://localhost:8765/index.html#/home'); await p.waitForTimeout(2500); await p.screenshot({ path: process.argv[2] + '/job-home.png' });
  await p.goto('http://localhost:8765/index.html#/m/j07/learn'); await p.waitForTimeout(300); await p.screenshot({ path: process.argv[2] + '/job-mission.png' });
  const a = await c.newPage(); await a.goto('http://localhost:8765/follow.html#sync=' + b64({ u: 'http://localhost:8767', k: 'test', a: 'adv' })); await a.waitForTimeout(2500);
  const brief = await a.innerText('#abox'); await a.click('[data-at="learning"]'); await a.waitForTimeout(200); const learn = await a.innerText('#abox');
  await a.click('[data-at="brief"]'); await a.waitForTimeout(200); await a.screenshot({ path: process.argv[2] + '/job-advisor.png', fullPage: true });
  console.log(JSON.stringify(st), '| brief employed:', brief.includes('Employed'), '| advisor wins:', learn.includes('Trained 20 installers'));
  console.log('errors:', errs.length ? errs : 'none'); await br.close();
})();

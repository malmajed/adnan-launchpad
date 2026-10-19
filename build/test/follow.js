// Regression: an Adnan app used in the same browser must not hide the cloud data in the Advisor view.
const { chromium } = require('playwright');
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64');
(async () => {
  await fetch('http://localhost:8767', { method: 'POST', body: JSON.stringify({ key: 'test', state: { xp: 75, savedAt: Date.now() - 864e5, progress: {}, log: [], compass: { done: 1, a: {} } } }) });
  const br = await chromium.launch(); const c = await br.newContext(); const p = await c.newPage();
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(600); if (await p.$('#wgo')) await p.click('#wgo'); await p.waitForTimeout(800);
  const a = await c.newPage(); await a.goto('http://localhost:8765/follow.html#sync=' + b64({ u: 'http://localhost:8767', k: 'test', a: 'adv' })); await a.waitForTimeout(3000);
  const xp = await a.evaluate(() => state.xp); console.log('advisor shows xp', xp, xp === 75 ? 'PASS' : 'FAIL'); await br.close();
})();

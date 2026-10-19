// Regression: connecting a device whose local state is empty but newer must load the cloud copy, never overwrite it.
const { chromium } = require('playwright');
(async () => {
  await fetch('http://localhost:8767', { method: 'POST', body: JSON.stringify({ key: 'test', state: { xp: 75, savedAt: Date.now() - 864e5, progress: { l02: { status: 'started', steps: {} } }, log: [], compass: { done: 1, a: {} } } }) });
  const br = await chromium.launch(); const p = await br.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  if (await p.$('#wgo')) await p.click('#wgo'); await p.waitForTimeout(500);
  await p.goto('http://localhost:8765/index.html#/settings'); await p.waitForTimeout(500);
  await p.fill('#syncUrl', 'http://localhost:8767'); await p.fill('#syncKey', 'test'); await p.click('#ssv'); await p.waitForTimeout(4000);
  const local = await p.evaluate(() => state.xp);
  const remote = (await (await fetch('http://localhost:8767/?key=test')).json()).state.xp;
  console.log('device now shows xp', local, '| cloud xp', remote, remote === 75 && local === 75 ? 'PASS' : 'FAIL', errs.length ? errs : '');
  await br.close();
})();

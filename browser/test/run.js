const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  await pg.goto('file://' + __dirname + '/page.html');
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/../claude-hebrew-rtl.user.js', 'utf8') });
  // simulate streaming: a new Hebrew paragraph and an edit that flips a paragraph
  await pg.evaluate(() => { const p = document.createElement('p'); p.id = 'stream'; p.textContent = 'Claude'; document.getElementById('msg').appendChild(p); setTimeout(() => { p.textContent = 'פסקה שנוספה בזמן הזרמה.'; }, 50); });
  await pg.waitForTimeout(500);
  const r = await pg.evaluate(() => Object.fromEntries(['h','p1','p2','ul','li1','ol','p3','pre','tb','td1','td2','stream','edp'].map(id => {
    const el = document.getElementById(id), cs = getComputedStyle(el);
    return [id, `${cs.direction} ${cs.textAlign} pl=${cs.paddingLeft} pr=${cs.paddingRight}`];
  })));
  console.log(r);
  const expected = { h: 'rtl', p1: 'rtl', p2: 'ltr', ul: 'rtl', li1: 'rtl', ol: 'rtl', p3: 'rtl', pre: 'ltr', tb: 'rtl', td1: 'rtl', td2: 'ltr', stream: 'rtl', edp: 'rtl' };
  const wrong = Object.entries(expected).filter(([id, dir]) => !r[id].startsWith(dir));
  if (wrong.length) { console.error('FAIL:', wrong); process.exitCode = 1; } else console.log('PASS: all blocks have the expected direction');
  // geometry: text in p1 right edge vs container right edge
  const g = await pg.evaluate(() => { const m = document.getElementById('msg').getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(document.getElementById('p2')); const r2 = range.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(document.getElementById('td2')); return {msgRight: m.right, p2TextLeft: r2.left, msgLeft: m.left}; });
  console.log(g);
  await pg.screenshot({ path: __dirname + '/shot.png', fullPage: true });
  await b.close();
})();

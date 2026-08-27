const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  // We need to load it via file:// or http://. CSP behaves slightly differently, but worker-src 'self' applies to both.
  const fileUrl = `file:///${path.join(__dirname, 'index.html').replace(/\\/g, '/')}`;
  console.log('Navigating to', fileUrl);

  await page.goto(fileUrl);

  // wait a bit for worker to execute
  await new Promise(r => setTimeout(r, 2000));

  await browser.close();
})();

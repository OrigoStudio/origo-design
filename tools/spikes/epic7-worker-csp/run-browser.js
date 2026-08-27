const http = require('http');
const fs = require('fs');
const path = require('path');

let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch {
  console.error('[spike:epic7] Puppeteer is not installed in this environment.');
  console.error(
    '[spike:epic7] To run the browser harness, install puppeteer or run node-worker-harness.'
  );
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

(async () => {
  const spikeDir = __dirname;

  // 1. Start a local HTTP server to enforce real HTTP origin semantics
  const server = http.createServer((req, res) => {
    const filePath = path.join(spikeDir, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const serverUrl = `http://127.0.0.1:${port}/index.html`;
  console.log(`[spike:epic7] Local HTTP server listening at ${serverUrl}`);

  let hasPageError = false;

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => {
      console.error('BROWSER ERROR:', error.message);
      hasPageError = true;
    });

    console.log('Navigating to', serverUrl);
    await page.goto(serverUrl);

    // 2. Wait for worker output to populate in DOM instead of arbitrary setTimeout
    await page.waitForFunction(
      () => {
        const el = document.getElementById('output');
        return el && el.innerText.trim().length > 0;
      },
      { timeout: 10000 }
    );

    const outputText = await page.$eval('#output', el => el.innerText);
    console.log('Worker Result Output:\n', outputText);

    await browser.close();
    server.close();

    // 3. Assert passing state
    const resultObj = JSON.parse(outputText);
    if (hasPageError || resultObj.status !== 'success') {
      console.error('[spike:epic7] Validation test FAILED:', resultObj);
      process.exit(1);
    }

    console.log('[spike:epic7] Validation test PASSED cleanly under HTTP CSP!');
    process.exit(0);
  } catch (err) {
    console.error('[spike:epic7] Test execution error:', err.message);
    server.close();
    process.exit(1);
  }
})();

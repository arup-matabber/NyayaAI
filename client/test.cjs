const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE EXCEPTION:', exception));
  page.on('requestfailed', request => console.log('REQ FAILED:', request.url(), request.failure().errorText));
  
  await page.goto('http://localhost:5173/');
  console.log('Navigated to Landing. Writing query...');
  await page.fill('input[placeholder="Ask anything or upload files..."]', 'Please draft a legal document');
  await page.keyboard.press('Enter');
  
  await page.waitForTimeout(2000);
  console.log('Current URL:', page.url());
  
  await browser.close();
})();

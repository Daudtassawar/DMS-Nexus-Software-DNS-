const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('response', response => {
        if (!response.ok()) {
            console.log('API RESPONSE ERROR:', response.url(), response.status());
        }
    });

    console.log("Navigating to http://localhost:5174 ...");
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });
    
    // Wait a bit to ensure everything is rendered
    await new Promise(r => setTimeout(r, 2000));
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (!bodyHTML || bodyHTML.includes('id="root"></div>')) {
        console.log("Looks like a blank screen!");
    } else {
        console.log("Some UI rendered.");
    }
    
    await browser.close();
})();

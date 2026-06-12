const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Report configuration
const reportDir = path.join(__dirname, '..', 'reports');
const reportPath = path.join(reportDir, 'selenium-report.xlsx');
const records = [];

function addRecord(testCase, status, startedAt, endedAt, details) {
    const duration = ((endedAt - startedAt) / 1000).toFixed(2);
    records.push({
        'Test Case': testCase,
        'Status': status,
        'Started At': startedAt.toISOString(),
        'Ended At': endedAt.toISOString(),
        'Duration (s)': duration,
        'Details': details
    });
}

function generateExcelReport() {
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    const workbook = xlsx.utils.book_new();
    const worksheetData = [
        ['Test Case', 'Status', 'Started At', 'Ended At', 'Duration (s)', 'Details'],
        ...records.map(r => [r['Test Case'], r['Status'], r['Started At'], r['Ended At'], r['Duration (s)'], r['Details']])
    ];
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Selenium Test Analysis');
    xlsx.writeFile(workbook, reportPath);
    console.log(`\n📊 Web Testing Analysis Report generated at: ${reportPath}`);
}

(async function runSeleniumTest() {
    const globalStart = new Date();
    const options = new chrome.Options();
    // Enable headless mode if you don't want the browser to pop up.
    // options.addArguments('--headless=new');

    let driver;
    try {
        console.log('🚀 Initializing Selenium session for SmartNotes Web Portal...');
        const initStart = new Date();
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        addRecord('Initialize Browser', 'PASS', initStart, new Date(), 'Chrome browser launched successfully');

        // Step 1: Navigate to Login Page
        const step1Start = new Date();
        console.log('Step 1: Navigating to login page...');
        await driver.get('http://localhost:3000/login');
        
        // Wait for email input to ensure page is loaded
        const emailInput = await driver.wait(until.elementLocated(By.xpath('//input[@type="email"]')), 60000);
        await driver.wait(until.elementIsVisible(emailInput), 60000);
        addRecord('Navigate to Login', 'PASS', step1Start, new Date(), 'Login page loaded and email input is visible.');

        // Step 2: Perform E2E Login
        const step2Start = new Date();
        console.log('Step 2: Entering test credentials and clicking Sign In...');
        
        await emailInput.sendKeys('shreyassatishkumar@gmail.com');
        
        const passwordInput = await driver.findElement(By.xpath('//input[@type="password"]'));
        await passwordInput.sendKeys('123456');
        
        // Find button by checking for type submit or containing "Sign In" text
        const signInBtn = await driver.findElement(By.xpath('//button[contains(., "Sign In")]'));
        await signInBtn.click();
        
        addRecord('Execute Login Flow', 'PASS', step2Start, new Date(), 'Entered credentials and clicked Sign In');

        // Step 3: Verify Dashboard Loaded
        const step3Start = new Date();
        console.log('Step 3: Verifying navigation to Dashboard...');
        
        // Wait for the URL to change to /dashboard or for a dashboard element to appear.
        // Waiting for URL change up to 60 seconds.
        await driver.wait(until.urlContains('/dashboard'), 60000);
        addRecord('Verify Dashboard Loaded', 'PASS', step3Start, new Date(), 'Successfully logged in and navigated to Dashboard');

        console.log('✅ Web Selenium E2E Test Completed successfully.');
        addRecord('Overall Web Execution', 'PASS', globalStart, new Date(), 'All automated web steps completed successfully.');
    } catch (error) {
        console.error('❌ Web E2E Test Failed:', error);
        addRecord('Overall Web Execution', 'FAIL', globalStart, new Date(), `Error encountered: ${error.message}`);
    } finally {
        if (driver) {
            await driver.quit();
        }
        generateExcelReport();
    }
})();

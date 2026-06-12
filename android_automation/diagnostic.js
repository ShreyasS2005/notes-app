'use strict';
const { remote } = require('webdriverio');
const fs   = require('fs-extra');
const path = require('path');

const apkPath = path.resolve(__dirname, '../app/build/outputs/apk/debug/app-debug.apk');

(async () => {
    const driver = await remote({
        hostname: '127.0.0.1', port: 4723, path: '/', logLevel: 'error',
        capabilities: {
            platformName             : 'Android',
            'appium:automationName' : 'UiAutomator2',
            'appium:udid'           : 'ZA222XNCRG',
            'appium:deviceName'     : 'moto g85 5G',
            'appium:platformVersion': '16',
            'appium:app'            : apkPath,
            'appium:appPackage'     : 'com.ai.smart.notes',
            'appium:appActivity'    : '.ui.MainActivity',
            'appium:autoGrantPermissions': true,
            'appium:noReset'        : false,
            'appium:fullReset'      : false,
            'appium:newCommandTimeout': 120,
        }
    });

    console.log('Session created. Waiting 6s for app to settle...');
    await new Promise(r => setTimeout(r, 6000));

    // Screenshot
    fs.ensureDirSync(path.join(__dirname, 'reports/screenshots'));
    const shot = path.join(__dirname, 'reports/screenshots/diagnostic.png');
    fs.writeFileSync(shot, Buffer.from(await driver.takeScreenshot(), 'base64'));
    console.log('Screenshot saved:', shot);

    // Dump all visible text
    const src = await driver.getPageSource();
    const matches = src.match(/text="([^"]{2,60})"/g) || [];
    const texts = matches.map(m => m.replace(/text="/, '').replace(/"$/, '')).filter(t => t.trim());
    const unique = Array.from(new Set(texts));
    console.log('\n=== VISIBLE TEXT ON SCREEN ===');
    unique.forEach(t => console.log(' •', t));
    console.log('==============================\n');

    await driver.deleteSession();
    console.log('Done.');
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

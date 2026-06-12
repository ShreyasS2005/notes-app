# SmartNotes AI - Multi-Platform E2E Testing Guide

This guide provides instructions for executing automated E2E tests for both the Web Application (Selenium) and the Android Application (Appium). Both suites generate a detailed Excel testing analysis report upon completion.

---

## 🌐 1. Web Application: Selenium E2E Testing

### **Setup**
1. Navigate to the web portal directory:
   ```bash
   cd web_portal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### **Execution**
1. Ensure your local backend is running (`cd backend && node server.js`).
2. Start the web app:
   ```bash
   npm start
   ```
3. In a new terminal, run the test:
   ```bash
   npm test
   ```

### **Analysis Report**
- **Format**: Excel (.xlsx)
- **Location**: `web_portal/reports/selenium-test-report.xlsx`
- **Contains**: Test Case name, Status (PASS/FAIL), Start/End times, Duration, and specific Error Details.

---

## 📱 2. Android Application: Appium E2E Testing

### **Prerequisites**
1. **Appium Server**: Install and start the Appium server (`npm install -g appium`).
2. **UiAutomator2**: Install the driver: `appium driver install uiautomator2`.
3. **Build APK**: Ensure your Android app is built. Run:
   ```bash
   ./gradlew assembleDebug
   ```
   *The test looks for the APK at `app/build/outputs/apk/debug/app-debug.apk`.*

### **Setup**
1. Navigate to the automation directory:
   ```bash
   cd android_automation
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### **Execution**
1. Start the Appium server on your machine (default port 4723).
2. Ensure an Android Emulator or physical device is connected (`adb devices`).
3. Run the automated suite:
   ```bash
   npm test
   ```

### **Analysis Report**
- **Format**: Excel (.xlsx)
- **Location**: `android_automation/reports/android-appium-report.xlsx`
- **Contains**: Detailed analysis of Home Screen verification, Navigation flows, and AR Projection interactions.

---

## 🔒 Safety Note
- **No changes** were made to your production Android source code (`ArStudyScreen.kt`).
- The automation logic is strictly isolated in `web_portal/` and `android_automation/` folders.

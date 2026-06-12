# SmartNotes AI - E2E Automation Instructions

This document provides the procedures to execute Selenium testing for the Web Portal and Appium testing for the Android Application. Both suites generate Excel reports for final testing analysis.

---

## 🌐 1. Web Portal: Selenium E2E Testing
Follow these steps to test the React web application.

### **Setup & Deployment (Following Document Steps)**
1. **GitHub Setup**: Initialize git in `web_portal` and link your repo.
2. **Install gh-pages**: `npm install gh-pages --save-dev` (Pre-installed in `package.json`).
3. **Deploy**: Run `npm run deploy` to build and publish to GitHub Pages.

### **Localhost Automation Execution**
1. Start the Backend:
   ```bash
   cd backend && node server.js
   ```
2. Start the Web App:
   ```bash
   cd web_portal && npm start
   ```
3. Run Selenium Tests:
   ```bash
   cd web_portal && npm test
   ```
4. **Report**: Find the analysis at `web_portal/reports/selenium-test-report.xlsx`.

---

## 📱 2. Android Application: Appium E2E Testing
Follow these steps to test the native Android application.

### **Setup**
1. **Build the App**: Ensure you have a fresh debug APK:
   ```bash
   ./gradlew assembleDebug
   ```
2. **Start Appium**: Ensure the Appium server is running on port 4723.
3. **Connect Device**: Ensure an emulator or physical device is active via `adb devices`.

### **Automation Execution**
1. Navigate to the automation folder:
   ```bash
   cd android_automation
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Appium Tests:
   ```bash
   npm test
   ```

### **Analysis Report**
- **Format**: Excel (.xlsx)
- **Location**: `android_automation/reports/android-appium-report.xlsx`
- **Details**: Tracks initialization, Home screen verification, Navigation to AR Study, and UI interactions with detailed duration and status logs.

---

## 🔒 Safety Information
- **App Module Safe**: No changes were made to `app/src/main/java` or `app/build.gradle.kts`.
- **Isolation**: All automation logic is kept in `web_portal/` and `android_automation/` directories.

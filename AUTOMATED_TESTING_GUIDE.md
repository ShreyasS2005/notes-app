 Zero-Touch Automated Testing Guide (Web & Android)

This document provides instructions for executing the fully automated, zero-touch Selenium and Appium testing suites. Both suites automatically perform UI actions without human intervention and generate comprehensive Excel test reports upon completion.

---

## 🌐 1. Web Application: Zero-Touch Selenium Testing

The Web Application tests are located in the `website/` directory. The test script (`website/tests/seleniumTest.js`) automatically opens a Chrome browser, navigates to the local application, performs a login flow, verifies the dashboard load, and then saves an Excel report.

### **Setup & Execution Steps**
1. **Ensure the Website is Running Locally**:
   - Open a terminal and navigate to the `website` directory.
   - Start the Next.js development server:
     ```bash
     cd website
     npm run dev
     ```
   - Ensure it is running at `http://localhost:3000`.

2. **Run the Selenium E2E Automation**:
   - Open a **new** terminal window.
   - Navigate to the `website` directory and run the test script:
     ```bash
     cd website
     npm test
     ```

3. **View the Results**:
   - Once the Chrome window automatically closes, an Excel report is generated.
   - You can find the report at: `website/reports/selenium-report.xlsx`.

---

## 📱 2. Android Application: Zero-Touch Appium Testing

The Android tests are located in the `android_automation/` directory. The Appium test script automatically launches your compiled APK on a connected emulator, bypasses authentication, verifies the home screen, and interacts with the study screens before generating an Excel report.

### **Prerequisites & Setup**
1. **Ensure Android SDK & ADB are configured**.
2. **Build the Debug APK**:
   - Navigate to the main `app/` project folder.
   - Run the Gradle build:
     ```powershell
     .\gradlew.bat assembleDebug
     ```
3. **Start an Android Emulator**:
   - Open Android Studio and launch your preferred AVD (e.g., Pixel_9).
   - Verify it is recognized by running `adb devices`.

### **Execution Steps**
1. **Start the Appium Server**:
   - In a terminal, run the Appium server and leave it running:
     ```bash
     npx appium
     ```
     *(Ensure the UiAutomator2 driver is installed via `npx appium driver install uiautomator2` if not already present).*

2. **Run the Appium E2E Automation**:
   - Open a **new** terminal window.
   - Navigate to the `android_automation` directory.
   - Install dependencies (if you haven't yet) and run the test:
     ```bash
     cd android_automation
     npm install
     npm test
     ```

3. **View the Results**:
   - The test will execute on the emulator screen without any intervention.
   - Once completed, the Excel test report will be available at: `android_automation/reports/android-appium-report.xlsx`.

---

## 🔒 Safety and Isolation
- **No Production Code Changes**: The test scripts are isolated in the `tests/` folders and do not modify your core application source code.
- **Zero-Touch**: Both test suites are designed to handle timeouts, UI interactions, and teardown autonomously.

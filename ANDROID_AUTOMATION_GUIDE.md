# SmartNotes AI - Android Application Automation Instructions

This file details the step-by-step procedures for setting up and executing automated E2E Appium testing for the Android application in `android_automation/` and `app/`.

## Overview
- Android app location: `app/`
- Automation tool: Appium with WebdriverIO (UiAutomator2 Driver)
- Local test environment: Android Emulator or connected physical device
- Execution folder: `android_automation/`
- Test report: Excel spreadsheet (.xlsx)

---

## Step 1 — Verify Android SDK Environment Setup
Before beginning, ensure that your system has the Android SDK installed and standard environment variables configured:
```powershell
$env:ANDROID_HOME="C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk"
$env:PATH="$env:ANDROID_HOME\platform-tools;$env:PATH"
```
Verify the installation by running `adb --version` in your terminal.

---

## Step 2 — Install Appium Server Globals
Install the global Appium server on your host machine:
```powershell
npm install -g appium
```

---

## Step 3 — Install Appium UiAutomator2 Driver
Install the official Android UiAutomator2 driver:
```powershell
appium driver install uiautomator2
```
Verify the active drivers by running `appium driver list`.

---

## Step 4 — Build the Debug APK
Build the debug version of your Android application using Gradle. From the root directory:
```powershell
.\gradlew.bat assembleDebug
```
This command compiles the Compose code and places the output APK file at:
`app/build/outputs/apk/debug/app-debug.apk`

---

## Step 5 — Prepare the Emulator or Physical Device
1. Open Android Studio and start your virtual device (Emulator), or connect a physical Android device.
2. Enable **USB Debugging** on the target device.
3. Verify the device is connected by running:
```powershell
adb devices
```
You should see your emulator (e.g. `emulator-5554`) or physical device listed.

---

## Step 6 — Navigate to Automation Directory
Open a terminal window and enter the automation directory:
```powershell
cd c:\Users\shrey\Downloads\app\android_automation
```

---

## Step 7 — Install Automation Dependencies
Install the package dependencies (WebdriverIO, XLSX utilities, and fs-extra):
```powershell
npm install
```

---

## Step 8 — Local Appium Server Launch
In a separate terminal window, launch the Appium server on its default port:
```powershell
appium
```
Keep this window running. It serves requests at `http://localhost:4723`.

---

## Step 9 — Review Appium Capabilities
The automation capabilities are configured inside `android_automation/tests/appiumTest.js`:
- `platformName`: `'Android'`
- `automationName`: `'UiAutomator2'`
- `app`: Path to the compiled debug APK (`app-debug.apk`)
- `appPackage`: `'com.ai.smart.notes'`
- `appActivity`: `'.ui.MainActivity'`

---

## Step 10 — E2E Test Execution Steps
The Appium suite executes a real end-to-end flow:
1. **Initialize App**: Launches the APK file.
2. **Verify Login Screen**: Waits for the splash screen to transition and checks that the login form components appear.
3. **Execute Login**: Inputs mock credentials (`test@example.com` / `password123`) and clicks `AUTHORIZE`.
4. **Verify Home Screen**: Confirms that the login bypass works and "AI Neural Tools" are visible.
5. **Navigate to AR Study**: Clicks the `"AR Study"` button and waits for the `"Neural AR Viz"` screen.
6. **Interact with AR Screen**: Clicks `"CLEAR NEURAL PROJECTIONS"` to verify AR session control.

---

## Step 11 — Execute Appium Tests
Ensure the Appium server is running and your device is active, then run:
```powershell
npm test
```
The test run will display live terminal execution checkpoints as it interacts with the emulator.

---

## Step 12 — Generate Analysis Report
Upon completion, the test script automatically gathers logs, calculates step durations, and exports an Excel report:
- **Location**: `android_automation/reports/android-appium-report.xlsx`
- **Fields**: Test Case Name, Status (PASS/FAIL), Start Time, End Time, Duration, and Action Details.

---

## Step 13 — UI Test Hooks and Compositions
The Compose UI uses standard text components for Appium detection:
- OutlinedTextField labeled `"Email Address"`
- OutlinedTextField labeled `"Secret Password"`
- Button containing `"AUTHORIZE"`
- ToolButton containing `"AR Study"`
- Button containing `"CLEAR NEURAL PROJECTIONS"`

---

## Step 14 — Running Headless or Mock Testing
Since Appium needs a physical/virtual device layout, you can execute this headlessly on CI servers by linking Appium with headless Android Emulators via GitHub Actions runner tools.

---

## Step 15 — Local Backend Coordination
To test network-integrated API responses, run your local backend in parallel:
```powershell
cd c:\Users\shrey\Downloads\app\backend
npm start
```
However, the Login bypass ensures the basic screen routing tests succeed even offline.

---

## Final Architecture
```text
Android Emulator / Device
           ↑ (via adb)
     Appium Server
           ↑ (via WebDriverIO Protocol)
  android_automation/tests/appiumTest.js
           ↓
Excel Report: android-appium-report.xlsx
```

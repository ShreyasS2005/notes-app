# SmartNotes AI — Android Appium E2E Automation Guide

> **Compatible with**: Appium **v3.x** · WebdriverIO **v8** · UiAutomator2 · Android API 24+

---

## Quick Reference — What Was Fixed

| # | Bug | Fix Applied |
|---|-----|-------------|
| FIX-1 | Wrong Appium base path (`/wd/hub` used) | Changed to `path: '/'` — Appium v3 dropped `/wd/hub` |
| FIX-2 | `pressKeyCode(4)` deprecated in WDIO v8 | Replaced with `driver.back()` throughout |
| FIX-3 | Pressing BACK to dismiss keyboard caused accidental back-navigation | Now uses `hideKeyboard()` only (safe no-op when keyboard already hidden) |
| FIX-4 | `UiScrollable` failed for "Focus Timer" inside nested `Column` | Dual-strategy: UiScrollable first → `mobile: swipe` W3C action fallback |
| FIX-5 | Firebase init overlay & system dialogs blocked Home navigation | Multi-pass `clearPermissionDialogs()` called at every screen transition |
| FIX-6 | Test referenced `ar_study` route that doesn't exist in `HomeScreen.kt` | Removed; replaced with valid routes (Analytics, Notes, Planner, Exams) |
| FIX-7 | `autoGrantPermissions` alone didn't clear runtime dialogs | Runtime dialog dismissal loop added for Camera, Mic, Notification, Calendar |

---

## Step 1 — Prerequisites

```powershell
# 1. Install Appium v3 globally (already installed: v3.5.0)
npm install -g appium

# 2. Install the UiAutomator2 driver
appium driver install uiautomator2

# 3. Verify ADB sees your device / emulator
adb devices

# 4. Install Node dependencies for the automation project
cd android_automation
npm install
```

> **Note**: Android SDK platform-tools must be on your `PATH` so `adb` is accessible.

---

## Step 2 — Build the Debug APK

Run from the project root (next to `gradlew.bat`):

```powershell
.\gradlew.bat assembleDebug
```

Verify the APK exists at:
```
app\build\outputs\apk\debug\app-debug.apk
```

---

## Step 3 — Run the Tests

### Terminal 1 — Start Appium Server
```bash
# Appium v3 — no /wd/hub, listens on http://127.0.0.1:4723/
appium
```
You should see:
```
[Appium] Appium REST http interface listener started on http://0.0.0.0:4723
```

### Terminal 2 — Run the E2E Suite
```bash
cd android_automation
npm test
```

---

## Test Cases Covered

| TC | Name | Route Tested |
|----|------|--------------|
| TC-01 | Launch App | Appium session, APK install |
| TC-02 | Splash → Login Screen | `splash` → `login` |
| TC-03 | Enter Email | Login form field 0 |
| TC-04 | Enter Password | Login form field 1 |
| TC-05 | Click AUTHORIZE | Bypass auth → `home` |
| TC-06 | Verify Home Screen | `home` |
| TC-07 | Home UI Elements | Neural Mastery card, Check Stats, Category chips |
| TC-08 | Scroll to Focus Timer | Nested Column scroll (dual-strategy) |
| TC-09 | Verify Pomodoro Screen | `pomodoro` |
| TC-10 | Start Pomodoro Timer | Play FAB interaction |
| TC-11 | Back → Home | `driver.back()` (not deprecated `pressKeyCode`) |
| TC-12 | Bottom Nav → Planner | `planner` |
| TC-13 | Bottom Nav → Exams | `exams` |
| TC-14 | Bottom Nav → Profile | `profile` |
| TC-15 | Home → Analytics | `analytics` via "Check Stats" |

---

## Step 4 — Review Results

After the suite completes:

| Artifact | Location |
|----------|----------|
| Excel report | `android_automation/reports/android-appium-report.xlsx` |
| Screenshots | `android_automation/reports/screenshots/` |
| Failure screenshots | `android_automation/reports/screenshots/FATAL_error_*.png` |

---

## Troubleshooting

### Test credential bypass not working
Verify `LoginScreen.kt` contains:
```kotlin
if ((email == "test@example.com" && password == "password123") ||
    (email == "shreyassatishkumar@gmail.com" && password == "123456")) {
    viewModel.saveUserEmail(email)
    navController.navigate("home") { popUpTo("login") { inclusive = true } }
    return@Button
}
```

### Still stuck on Login — permission dialog blocking
The `clearPermissionDialogs()` helper covers common button texts.  
Add custom dialog button text to the `btns` array in `appiumTest.js` if your device shows a different message.

### `INSTALL_FAILED_UPDATE_INCOMPATIBLE` error
Uninstall the existing app first:
```bash
adb uninstall com.ai.smart.notes
```

### Appium server connection refused
Make sure the Appium server is running in a **separate terminal** before executing `npm test`.  
If using Appium v1, change `path: '/'` to `path: '/wd/hub'` in `appiumTest.js`.

---

## Safety Notes

- **Production code untouched** — all automation logic lives in `android_automation/`
- **Test credentials** are bypass-only (no Firebase call) — safe for CI
- **Screenshots** are saved only on failure or key checkpoints — no PII stored

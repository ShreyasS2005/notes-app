# SmartNotes AI - Selenium E2E & GitHub Pages Deployment Instructions

This document maps the provided React deployment and Selenium E2E testing steps to the current `web_portal` project and gives you a single execution plan.

## Overview
- Web code is in `web_portal/`
- Selenium automation is in `web_portal/tests/seleniumTest.js`
- Deployment uses `gh-pages` with scripts in `web_portal/package.json`
- Android app and backend are left unchanged

---

## 1. Prepare the Web Portal for Automation
1. Open PowerShell or another terminal.
2. Navigate to the web folder:
   ```powershell
   cd c:\Users\shrey\Downloads\app\web_portal
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```

### What is already configured
- `web_portal/package.json` includes:
  - `selenium-webdriver`
  - `chromedriver`
  - `gh-pages`
  - `predeploy` and `deploy` scripts
- `web_portal/tests/seleniumTest.js` already performs an E2E summary flow using stable IDs:
  - `content-input`
  - `btn-summarize`
  - `result-display`

---

## 2. Run the Web App Locally
1. Start the React app:
   ```powershell
   npm start
   ```
2. Open a browser and verify the app is available at:
   ```text
   http://localhost:3000
   ```

---

## 3. Run Selenium E2E Tests
1. Confirm the web app is running at `http://localhost:3000`.
2. In a new terminal window, stay in `web_portal` and run:
   ```powershell
   npm test
   ```
3. Expected behavior:
   - Chrome opens (headless by default)
   - The app loads
   - A sample note is entered
   - The Summarize button is clicked
   - The result appears and is validated

> To see the browser during local execution, run:
> ```powershell
> $env:HEADLESS='false'; npm test
> ```

---

## 4. Set Up GitHub Pages Deployment
### Step 1: Push the web portal to GitHub
From `web_portal`:
```powershell
git init
git add .
git commit -m "Initial frontend upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
Replace `YOUR_USERNAME` and `YOUR_REPO`.

### Step 2: Update `package.json`
Open `web_portal/package.json` and set:
```json
"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO"
```

### Step 3: Deploy to GitHub Pages
```powershell
npm run deploy
```
This will:
- build the app
- publish the `build/` folder to GitHub Pages

### Step 4: Enable GitHub Pages in GitHub
1. Open your GitHub repository.
2. Go to `Settings → Pages`.
3. Under `Build and deployment`, select `Deploy from branch`.
4. Set `Branch` to `gh-pages`.
5. Save.

### Step 5: Access the live site
After deployment, the live URL should be:
```text
https://YOUR_USERNAME.github.io/YOUR_REPO
```

---

## 5. Verify the Deployment
Confirm the following:
- Homepage loads
- App route updates correctly
- Refresh works
- The summarization flow runs successfully

If you see 404 errors on direct routes, switch from `BrowserRouter` to `HashRouter` in your React router.

---

## 6. Optional GitHub Actions CI/CD
A sample workflow file can be added at `.github/workflows/selenium-e2e.yml` to run the headless Selenium test on every push.

### What it does
- installs dependencies
- runs `npm test` in `web_portal`
- reports success or failure

---

## 7. Notes and Safety
- The Android app in `/app` is not modified.
- The backend in `/backend` is not modified.
- Automation is isolated in `web_portal/`.
- Current E2E coverage validates the web summary flow, not a login page.

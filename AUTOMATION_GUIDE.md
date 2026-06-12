# SmartNotes AI - Web Application Automation Instructions

This file follows the React Deployment and Selenium E2E Testing steps for the web portal in `web_portal/`.

## Overview
- Frontend location: `web_portal/`
- Automation tool: Selenium WebDriver
- Deployment: GitHub Pages (`gh-pages`)
- Local backend: `backend/` via Firebase Functions

---

## Step 1 — Push Your React Project to GitHub
Inside `web_portal/`:
```powershell
cd c:\Users\shrey\Downloads\app\web_portal
git init
git add .
git commit -m "Initial frontend upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub details.

---

## Step 2 — Install GitHub Pages Package
Inside `web_portal/`:
```powershell
npm install gh-pages --save-dev
```

> Note: `web_portal/package.json` already includes `gh-pages`, but this command ensures it is installed for deployment.

---

## Step 3 — Update `package.json`
Open `web_portal/package.json` and add or update:
```json
"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO",
```
Inside `scripts`, confirm these entries exist:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

The current `web_portal/package.json` already contains the correct deployment scripts.

---

## Step 4 — Deploy React Project to GitHub Pages
From `web_portal/` run:
```powershell
npm run deploy
```
This command:
- builds the React application
- creates a production build
- uploads the build to GitHub Pages

---

## Step 5 — Enable GitHub Pages
1. Open your GitHub repository.
2. Go to `Settings → Pages`.
3. Under `Build and deployment`, select `Deploy from branch`.
4. Choose `Branch → gh-pages`.
5. Click `Save`.

---

## Step 6 — Access the Live Application
After deployment, the app should be available at:
```text
https://YOUR_USERNAME.github.io/YOUR_REPO
```

---

## Step 7 — React Router
This project currently does not use `react-router`. If you add routing later, use `HashRouter` to avoid GitHub Pages refresh 404s:
```js
import { HashRouter } from 'react-router-dom';
```
and replace `<BrowserRouter>` with `<HashRouter>`.

---

## Step 8 — Rebuild and Redeploy After Router Changes
If you change routing:
```powershell
npm run build
npm run deploy
```

---

## Step 9 — Verify Deployment
Verify the live site:
- Homepage loads
- buttons work
- refresh works
- summary flow works

Example direct URL can be:
```text
https://YOUR_USERNAME.github.io/YOUR_REPO
```

---

## Step 10 — Add Selenium E2E Testing
Inside `web_portal/` install Selenium and report generation libraries:
```powershell
npm install selenium-webdriver chromedriver xlsx --save-dev
```

The repository already includes `selenium-webdriver` and now uses `xlsx` to generate an Excel report automatically.

---

## Step 11 — Selenium Test Structure
Recommended structure in `web_portal/`:
```text
web_portal/
├── tests/
│   └── seleniumTest.js
├── reports/
│   └── selenium-test-report.xlsx
├── package.json
```
The current project already has `web_portal/tests/seleniumTest.js` and will now write the report to `web_portal/reports/selenium-test-report.xlsx`.

---

## Step 12 — Stable IDs for Automation
The existing web app already includes stable IDs in `web_portal/src/App.js`:
- `content-input`
- `btn-summarize`
- `btn-quiz`
- `btn-flashcards`
- `result-display`

These IDs allow Selenium to locate DOM elements reliably.

---

## Step 13 — Run Selenium Test Locally
1. Start the web app:
```powershell
cd c:\Users\shrey\Downloads\app\web_portal
npm install
npm start
```
2. Open a new terminal and run:
```powershell
cd c:\Users\shrey\Downloads\app\web_portal
npm test
```

This will:
- open Chrome
- load `http://localhost:3000`
- enter sample content
- click Summarize
- verify result text

> Important: Ensure your backend is running. In `backend/`, start the local API before running the web app:
>```powershell
>cd c:\Users\shrey\Downloads\app\backend
>npm install
>npm run start
>```

---

## Step 14 — Setup GitHub Actions
A sample GitHub Actions workflow is already present at `.github/workflows/selenium-e2e.yml`.
It installs dependencies and runs the Selenium E2E test on push and pull requests.

---

## Step 15 — Automatic CI/CD Testing
After pushing code to GitHub:
```powershell
git push
```
GitHub Actions will automatically trigger:
- build validation
- Selenium E2E tests
- deployment verification

---

## Final Architecture
Developer Push
      ↓
GitHub Repository
      ↓
GitHub Actions Trigger
      ↓
Selenium E2E Testing
      ↓
Production Validation
      ↓
Pass / Fail Report

This creates a modern frontend deployment and automation testing pipeline for the React web application.

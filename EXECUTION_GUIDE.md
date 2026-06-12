# E2E Automation Testing & Web Deployment Guide

This guide provides instructions on how to run the web version of SmartNotes AI locally and execute Selenium E2E tests, while keeping your Android application source code untouched.

## Prerequisites
- **Node.js**: Installed on your machine.
- **Google Chrome**: For running Selenium tests.
- **Firebase CLI**: If you plan to deploy the backend.

---

## Step 1: Local Web Setup
To run the web interface on `localhost`:

1. Open your terminal and navigate to the `web_portal` directory:
   ```bash
   cd web_portal
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm start
   ```
   *The app will be available at `http://localhost:3000`.*

---

## Step 2: Running Selenium E2E Tests
To automate the testing of the web application:

1. Ensure the web app is running (from Step 1).
2. Open a new terminal and navigate to `web_portal`:
   ```bash
   cd web_portal
   ```
3. Run the automation script:
   ```bash
   npm test
   ```
   *This will launch a Chrome instance, enter text into the SmartNotes AI portal, and verify the summarization feature.*

---

## Step 3: Deployment to GitHub Pages
Following the steps in your documentation image:

1. **Install gh-pages**: (Already included in `web_portal/package.json`)
   ```bash
   npm install gh-pages --save-dev
   ```
2. **Update package.json**: (Already configured)
   - Ensure the `"homepage"` field matches your GitHub URL.
   - Scripts for `"predeploy"` and `"deploy"` are already added.
3. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## Safety Note
All web-related files are contained within the `web_portal/` folder. Your Android source code in `app/` remains completely safe and unmodified.

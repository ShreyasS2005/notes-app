# SmartNotes AI - Web Automation & Deployment Guide

This guide follows the steps for React Deployment and Selenium E2E Testing while keeping the Android application source code safe.

## Step 1: Environment Setup
All web and automation files are located in the `web_portal` directory.
1. Open your terminal.
2. Navigate to the web portal:
   ```bash
   cd web_portal
   ```
3. Install the required packages (includes `gh-pages` and `selenium-webdriver`):
   ```bash
   npm install
   ```

## Step 2: Running the Web Application Locally
To test the web version before automation:
1. Run the start command:
   ```bash
   npm start
   ```
2. Open `http://localhost:3000` in your browser.
   *This connects to your existing backend at `localhost:5001`.*

## Step 3: Executing Selenium E2E Automation
To run the end-to-end tests:
1. Ensure the web application is running (Step 2).
2. Open a new terminal and run:
   ```bash
   npm test
   ```
   *The script (`tests/seleniumTest.js`) will automatically:*
   - Launch Chrome.
   - Navigate to the SmartNotes portal.
   - Enter a sample study note.
   - Click the "Summarize" button.
   - Verify that the AI returns a valid summary.

## Step 4: React Deployment (As per Documentation)
To deploy the web application to GitHub Pages:
1. **Push to GitHub**: Initialize git in the `web_portal` folder and push to your repository.
2. **Update package.json**: Open `web_portal/package.json` and change the `"homepage"` field to:
   `"homepage": "https://{your-github-username}.github.io/smart-notes-web"`
3. **Deploy**:
   ```bash
   npm run deploy
   ```

## Safety Summary
- **Android App (`/app`)**: No changes made. Proguard, AR screens, and logic remain untouched.
- **Backend (`/backend`)**: No changes made.
- **Automation Logic**: Fully isolated in the `web_portal` directory.

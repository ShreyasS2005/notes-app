# 📝 SmartNotes AI: Web E2E Automation & Deployment Guide

This guide follows the steps from your "React Deployment and Selenium E2E Testing Documentation".

---

## 🛠 Step 1: Local Environment Setup
Before deploying or testing, ensure your local environment is ready.

1. **Start the Backend API**:
   - Open a terminal and run:
     ```bash
     cd backend
     npm install
     node server.js
     ```
   - Keep this running. It serves the AI logic at `http://localhost:5001`.

2. **Start the React Web Application**:
   - Open a **new** terminal and run:
     ```bash
     cd web_portal
     npm install
     npm start
     ```
   - The app will open at `http://localhost:3000`.

---

## 🤖 Step 2: Automation Testing (Selenium E2E)
Once the app is running on localhost, you can execute the E2E tests.

1. **Execute Selenium Test**:
   - Open a **third** terminal window.
   - Run:
     ```bash
     cd web_portal
     node tests/seleniumTest.js
     ```
   - **What happens?** Selenium will launch a Chrome browser, navigate to your site, input text into the notes area, click "Summarize", and verify the AI's response.

---

## 🚀 Step 3: Deployment (As per Documentation)

### 1 — Push Your React Project to GitHub
Initialize git in the `web_portal` directory and push it to a repository:
```bash
cd web_portal
git init
git remote add origin <your-github-repo-url>
git add .
git commit -m "Initial commit for web portal"
git push -u origin main
```

### 2 — Install GitHub Pages Package
Run this in the `web_portal` directory:
```bash
npm install gh-pages --save-dev
```

### 3 — Update package.json
I have already added the following to your `web_portal/package.json`:
- **Homepage**: `"homepage": "http://localhost:3000"` (Update this to your GitHub repo URL for live deployment).
- **Predeploy Script**: `"predeploy": "npm run build"`
- **Deploy Script**: `"deploy": "gh-pages -d build"`

**To Deploy Live:**
```bash
npm run deploy
```

---

## 🔒 Safety Information
Your Android application code in `app/src/main/java/...` (including `ArStudyScreen.kt`) is **safe** and was not modified during this process. All web-specific code is isolated in the `web_portal/` folder.

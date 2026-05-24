# Japan Trip 2026 – Setup Guide

## Step 1: Create Firebase Project (3 minutes)

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Project name: `japan-trip-2026`
4. Disable Google Analytics (not needed) → Click "Create project"

## Step 2: Enable Realtime Database

1. In the left sidebar: click "Realtime Database"
2. Click "Create database"
3. Select region: `us-central1` (default)
4. Select **"Start in test mode"** → Click "Enable"

## Step 3: Get your Firebase Config

1. Click the gear icon (top left) → "Project settings"
2. Scroll down to "Your apps" → Click the `</>` Web icon
3. App nickname: `japan-trip` → Click "Register app"
4. You will see a `firebaseConfig` object – **copy it**

It looks like this:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "japan-trip-2026.firebaseapp.com",
  databaseURL: "https://japan-trip-2026-default-rtdb.firebaseio.com",
  projectId: "japan-trip-2026",
  storageBucket: "japan-trip-2026.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Update the Code

1. Open `src/App.jsx`
2. Find this section near the top:
```js
const firebaseConfig = {
  apiKey: "REPLACE_API_KEY",
  authDomain: "REPLACE_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://REPLACE_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "REPLACE_PROJECT_ID",
};
```
3. Replace it with the config you copied from Firebase

## Step 5: Deploy to Vercel (2 minutes)

1. Go to https://vercel.com → Sign up with Google
2. Click "Add New Project"
3. Drag and drop the `japan-trip` folder
4. Click **Deploy**
5. You get a link like `japan-trip-xxx.vercel.app` → Share with family!

## What everyone can do on the site

- Tap **Edit mode** to edit any day in the itinerary
- Add notes to any day
- Check off tasks and add new ones
- All changes sync in real time for everyone

## Local development (optional)

If you want to run it locally first:
```bash
cd japan-trip
npm install
npm run dev
```
Then open http://localhost:5173

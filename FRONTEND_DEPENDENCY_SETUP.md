# ⚡ FRONTEND SETUP - DEPENDENCY INSTALLATION REQUIRED

## Issue

The frontend failed to start because npm dependencies haven't been installed yet.

## ✅ Solution (Quick Fix)

### Option 1: Using Command Line (Recommended)

**Step 1: Open Command Prompt or PowerShell**

```bash
# Navigate to frontend directory
cd "d:\$Website\Smart Hotel Management\Smart_Hotel_Management\frontend"

# Install all dependencies
npm install
```

The installation will download and install:

- ✅ react-router-dom (v6.28.0)
- ✅ zustand (v4.5.5)
- ✅ axios (v1.7.7)
- ✅ socket.io-client (v4.8.1)
- ✅ lucide-react (v0.463.1)
- ✅ clsx (v2.1.1)

**Step 2: Start the frontend**

```bash
npm run dev
```

**Step 3: Open in browser**

```
http://localhost:5173
```

---

### Option 2: Using Batch File (Windows)

**Double-click this file:**

```
install-and-run.bat
```

It will automatically:

1. Navigate to frontend directory
2. Run npm install
3. Show you the next steps

---

## 📋 What Was Fixed

All import paths have been corrected:

```
LoginPage.jsx         ✅ Updated imports
DashboardPage.jsx     ✅ Updated imports
OrdersPage.jsx        ✅ Updated imports
MenuPage.jsx          ✅ Updated imports
BookingsPage.jsx      ✅ Updated imports
ReportsPage.jsx       ✅ Updated imports
```

---

## ⏱️ Installation Time

- **First install:** 3-5 minutes (downloads ~400MB)
- **Subsequent starts:** ~30 seconds

---

## ✨ After Installation

You'll see:

```
✓ VITE v8.0.13 ready in 300ms
✓ Local: http://localhost:5173/
✓ Network: use --host to expose
```

Then open your browser to `http://localhost:5173`

---

## 🔐 Login Credentials

```
Email:    admin@smarthms.com
Password: admin123
```

---

## 🚀 Full System Setup

If you haven't started the backend, do this in another terminal:

```bash
cd backend
npm install
npm start
```

This ensures both systems run together:

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173

---

## ✅ Verification Checklist

After installation, verify:

- [ ] `node_modules` folder created in frontend directory
- [ ] No errors during npm install
- [ ] `npm run dev` starts without errors
- [ ] Browser shows login page at http://localhost:5173
- [ ] Login works with admin@smarthms.com / admin123

---

## 🆘 Troubleshooting

### Error: "npm: command not found"

- Install Node.js from https://nodejs.org/
- Restart command prompt after installation

### Error: "ENOENT: no such file or directory"

- Verify the frontend path is correct
- Use: `cd "d:\$Website\Smart Hotel Management\Smart_Hotel_Management\frontend"`

### Port 5173 already in use

- Kill the process: `lsof -ti:5173 | xargs kill -9` (Mac/Linux)
- Or use: `npm run dev -- --port 5174`

### Still seeing import errors

- Delete `node_modules` folder
- Delete `package-lock.json` file
- Run `npm install` again

---

## 📞 Support

If you encounter issues:

1. **Check Node version:** `node --version` (should be v16+)
2. **Check npm version:** `npm --version`
3. **Clear cache:** `npm cache clean --force`
4. **Reinstall:** Delete node_modules and run npm install again

---

**Status:** Ready for dependency installation ✅

**Next Step:** Run `npm install` in the frontend directory

---

**Version:** 1.0.0
**Date:** 2024

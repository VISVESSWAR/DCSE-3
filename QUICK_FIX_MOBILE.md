# Quick Fix for Mobile Reset Link

## Your Computer's IP Address
**192.168.0.103**

## Steps to Fix:

### 1. Update Backend .env File
Open `backend/.env` and add/update this line:

```env
FRONTEND_URL=http://192.168.0.103:5173
```

### 2. Restart Backend Server
Stop the backend server (Ctrl+C) and restart it:
```bash
cd backend
npm run dev
```

### 3. Make Sure Frontend is Running with Network Access
Your frontend should already be configured (vite.config.js updated), but make sure it's running:
```bash
npm run dev
```

You should see:
```
➜  Network: http://192.168.0.103:5173/
```

### 4. Test on Mobile
1. Make sure your mobile is on the **same Wi-Fi network** as your computer
2. Request a new password reset (old links won't work)
3. Check the email - the link should now be: `http://192.168.0.103:5173/reset-password?token=...`
4. Click the link on your mobile

### 5. If Link Still Doesn't Work
Use the **Manual Token Entry** option:
1. Open the reset link email on mobile
2. Copy the **entire link**
3. Extract the token (everything after `token=`)
4. On your mobile browser, go to: `http://192.168.0.103:5173/reset-password`
5. Click "Enter Token Manually"
6. Paste the token
7. Continue

## Troubleshooting

**If mobile can't reach the frontend:**
- Check Windows Firewall - allow port 5173
- Make sure both devices are on same Wi-Fi
- Try accessing `http://192.168.0.103:5173` directly on mobile browser first

**If you see "null" in the link:**
- Check backend/.env file has `FRONTEND_URL=http://192.168.0.103:5173`
- Restart backend server after changing .env
- Request a NEW password reset (old links won't update)


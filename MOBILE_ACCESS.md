# Mobile Access Setup Guide

## Problem
When accessing the reset password link on mobile, it may not work because the link uses `localhost` which only works on the same computer.

## Solution: Configure FRONTEND_URL for Mobile Access

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### Step 2: Update Your Backend .env File

Add or update `FRONTEND_URL` in `backend/.env`:

```env
FRONTEND_URL=http://YOUR_IP_ADDRESS:5173
```

For example:
```env
FRONTEND_URL=http://192.168.1.100:5173
```

### Step 3: Start Frontend with Network Access

Make sure your frontend (Vite) is accessible on the network:

```bash
npm run dev -- --host
```

Or update `vite.config.js`:
```js
export default {
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173
  }
}
```

### Step 4: Ensure Mobile Device is on Same Network

- Your mobile device must be on the same Wi-Fi network as your computer
- Both devices should be able to ping each other

### Step 5: Test

1. Request a password reset
2. Check the email - the link should now use your IP address instead of localhost
3. Click the link on your mobile device
4. It should work!

## Alternative: Manual Token Entry

If the link still doesn't work on mobile:

1. Open the reset link email on your mobile
2. Copy the entire link
3. Extract the token (the part after `token=`)
4. Go to the reset password page manually
5. Click "Enter Token Manually"
6. Paste the token
7. Continue with password reset

## Production

For production, set `FRONTEND_URL` to your actual domain:
```env
FRONTEND_URL=https://yourdomain.com
```


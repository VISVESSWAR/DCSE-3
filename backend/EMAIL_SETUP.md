# Email Setup Guide for Password Reset

The forgot password functionality uses nodemailer to send password reset emails. Here's how to configure it:

## Option 1: Gmail (Recommended for Development/Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to `.env` file**:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:5173
```

## Option 2: Custom SMTP Server

Add to `.env` file:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@facultyportal.com
FRONTEND_URL=http://localhost:5173
```

## Option 3: Development Mode (No Email Service)

If no email credentials are configured, the system will:
- Log the reset link to the console
- Return the reset link in the API response (development mode only)
- Display the reset link on the frontend for easy testing

## Testing

1. Start the backend server
2. Request password reset from the frontend
3. Check:
   - Email inbox (if email is configured)
   - Console logs (if email is not configured)
   - Frontend UI (development mode shows link)

## Production

For production, ensure:
- Email credentials are properly configured
- `NODE_ENV=production` is set
- `FRONTEND_URL` points to your production frontend URL
- Reset links will NOT be returned in API responses


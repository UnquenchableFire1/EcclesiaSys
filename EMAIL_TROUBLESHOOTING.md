# Email Delivery Troubleshooting Guide

## Current Status
- Email service is **configured and running on Render**
- SMTP server: `smtp.gmail.com` (port 587)
- Configuration: Gmail App Password method

## Why Emails May Not Be Arriving

Gmail has strict security policies that may block emails from:
1. Web servers (like Render) sending emails
2. Non-verified app passwords
3. Verification tokens that have expired

## How to Fix Email Delivery

### Step 1: Set Up Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable two-factor authentication (if not already enabled)
3. Go to "App passwords" section
4. Select "Mail" and "Windows Computer"
5. Gmail will generate a 16-character password
6. Copy this password - it includes spaces

### Step 2: Update Render Environment Variable

1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to "Environment"
4. Find or create `MAIL_PASSWORD` variable
5. Paste the 16-character app password (spaces included!)
6. Save and redeploy

**Current Password in .env (local):**
```
MAIL_PASSWORD=[GMAIL_APP_PASSWORD]  # placeholder - do not commit real password
```

### Step 3: Test Email Configuration

After updating Render, test the email endpoint:

```bash
curl -X POST https://ecclesiasys-bequ.onrender.com/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-personal-email@gmail.com"}'
```

Or use the test endpoint if deployed:
```bash
curl -X POST https://ecclesiasys-bequ.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

### Step 4: Check Render Logs

If test doesn't work, check server logs:

1. Go to Render Dashboard
2. Select your backend service
3. Go to "Logs"
4. Try password reset again
5. Look for messages like:
   - "✓ Password reset email sent successfully"
   - "Failed to send password reset email"
   - "B2 Authentication failed"

### Step 5: Check Gmail Spam/Security

1. Check Gmail SPAM folder
2. Check "Blocked and unverified apps" in Gmail security
3. Review security alerts at https://myaccount.google.com/device-activity

## Email Configuration Details

**File:** `backend/src/main/resources/application-production.properties`

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

## Environment Variables on Render (REQUIRED)

```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=benjaminbuckmanjunior@gmail.com
MAIL_PASSWORD=<YOUR 16-CHAR APP PASSWORD>
FRONTEND_URL=https://ecclesiasys-bequ.onrender.com
APP_FRONTEND_URL=https://ecclesiasys-bequ.onrender.com
```

## Alternative: Use Different Email Provider

If Gmail continues to block emails, consider:

### Option 1: SendGrid
1. Sign up at https://sendgrid.com
2. Get API key
3. Update Spring Mail configuration
4. Use `spring.mail.host=smtp.sendgrid.net`

### Option 2: AWS SES
1. Set up AWS SES
2. Get SMTP credentials from AWS console
3. Update configuration

### Option 3: Mailgun
1. Sign up at https://www.mailgun.com/
2. Get SMTP credentials
3. Update configuration

## How to Monitor Email Delivery

After fixing, you can:

1. **Test manually:** Use password reset form and check if email arrives
2. **Check logs:** 
   - Look for "Password reset email sent successfully" messages
   - Check for any SMTP errors
3. **Verify sender:** Emails should come from `benjaminbuckmanjunior@gmail.com`

## Next Steps

1. Update `MAIL_PASSWORD` environment variable on Render with your app password
2. Redeploy the backend service
3. Test with the password reset form
4. Check logs if emails don't arrive
5. Check Gmail spam folder
6. Verify Gmail security settings allow the emails

## Files Modified

- `backend/src/com/example/service/EmailService.java` - Enhanced logging
- `backend/src/com/example/controller/PasswordResetController.java` - Test endpoint
- `backend/src/main/resources/application-production.properties` - Configuration

## Questions?

If emails still aren't arriving:
1. Check the full Render logs for error messages
2. Verify the app password is correct (copy/paste from Gmail)
3. Make sure MAIL_USERNAME matches the Gmail account that owns the app password
4. Try the test endpoint to see detailed error messages

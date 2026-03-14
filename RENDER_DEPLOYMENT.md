# EcclesiaSys - Render Deployment & Environment Setup

## Overview

This guide explains how to deploy EcclesiaSys to Render.com and configure all required environment variables for the backend and frontend.

## Prerequisites

- Render.com account (free or paid)
- GitHub repository with EcclesiaSys code
- Gmail app password for email functionality
- TiDB Cloud database credentials (production)
- Backblaze B2 credentials for file storage

## Part 1: Configure Backend Environment Variables on Render

### Step 1: Access Render Dashboard

1. Log in to [Render.com](https://render.com)
2. Select your service (e.g., "bbj-digital-api" or similar)
3. Go to **Settings** → **Environment**

### Step 2: Set Database Environment Variables

Add these variables for TiDB Cloud connection:

```
DB_URL = jdbc:mysql://[host:port]/[database]?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME = [your-tidb-username]
DB_PASSWORD = [your-tidb-password]
```

**Example:**
```
DB_URL = jdbc:mysql://gateway01.eu-central-1.prod.tidbcloud.com:4000/bbj?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME = 3jxxxxxx4yyyyy@bbj
DB_PASSWORD = your-tidb-password-here
```

*Get these values from TiDB Cloud dashboard → Connection → Spring Boot*

### Step 3: Set Email Configuration Variables

Add these variables for Gmail SMTP (password reset functionality):

```
MAIL_HOST = smtp.gmail.com
MAIL_PORT = 587
MAIL_USERNAME = benjaminbuckmanjunior@gmail.com
MAIL_PASSWORD = vjmq iepu yhdd pjrx
```

**Important**: Use a **Gmail App Password**, not your regular Gmail password.

To generate a Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go back to Security and select **App passwords**
4. Choose "Mail" and "Windows Computer"
5. Copy the 16-character password generated (vjmq iepu yhdd pjrx)
6. Use this in `MAIL_PASSWORD`

### Step 4: Set Backblaze B2 Environment Variables

Add these variables for cloud file storage:

```
B2_KEY_ID = 5be753f9e33f
B2_APP_KEY = K005uAur9WX0YGfPwOwbdyCsVwKOhuA
```

*Get these from Backblaze B2 dashboard → Application Keys → Master Key*

### Step 5: Set Port Configuration

```
PORT = 8080
```

### Step 6: Save and Redeploy

1. Click **Save** after entering all variables
2. Go to **Deploy** and click **Deploy latest commit**
3. Wait for deployment to complete (check build logs)

---

## Part 2: Configure Frontend on Render (Static Site)

### Step 1: Build Frontend

The frontend is built during the Docker build process. Ensure the build configuration in `Dockerfile` includes:

```dockerfile
# Build React app
RUN npm run build
```

This outputs to `/frontend/build/`

### Step 2: Configure Static Site on Render

1. Create a new **Static Site** service
2. Connect your GitHub repository
3. Set build command:
   ```
   cd frontend && npm install && npm run build
   ```
4. Set publish directory:
   ```
   frontend/build
   ```

### Step 3: Deploy Frontend

1. Click **Deploy** to build and publish the frontend
2. Render will provide a URL (e.g., `https://bbj-digital-frontend.onrender.com`)

---

## Part 3: Testing Email Functionality

### Test Password Reset Email

1. **Register a new member** via the frontend
2. Use the **Forgot Password** feature
3. Email should arrive in the member's inbox (check account_email)
4. Click the reset link
5. Enter new password and save

### Troubleshooting Email Issues

**Problem**: Email not arriving
- Check `MAIL_USERNAME` and `MAIL_PASSWORD` are correct
- Verify Gmail app password (not regular password)
- Check email logs in Render dashboard → Logs

**Problem**: SMTP connection error
- Verify `MAIL_HOST=smtp.gmail.com` and `MAIL_PORT=587`
- Ensure TLS is enabled on staging/production

**Problem**: Authentication failed
- Gmail password must be generated via App Passwords (2-factor authentication required)
- Regular Gmail passwords won't work

---

## Part 4: Verifying Deployment

### Checklist

- [ ] Backend service deployed successfully
- [ ] Frontend static site deployed successfully
- [ ] All environment variables set on backend
- [ ] Database connection working (check Render logs)
- [ ] Email service initialized (check logs for Spring Mail config)
- [ ] Homepage loads at frontend URL
- [ ] Can register new member
- [ ] Can login as member
- [ ] Can upload files (announcements, events, sermons)
- [ ] Password reset email arrives
- [ ] Session timeout works (5 minutes of inactivity)

### Common Issues

**Issue**: 403/500 errors on API calls
- Check `CORS` configuration in `Application.java`
- Verify frontend URL matches backend CORS allowed origins
- Solution: Update allowed origins to `https://[frontend-domain].onrender.com`

**Issue**: File upload failing
- Check B2 credentials (`B2_KEY_ID` and `B2_APP_KEY`)
- Verify bucket exists in Backblaze B2 dashboard
- Check file size limit (500MB max configured)

**Issue**: Database connection timeout
- Test TiDB connection string locally first
- Verify IP whitelist on TiDB Cloud (add Render IP or allow all)
- Check `DB_URL` format matches TiDB exactly

---

## Part 5: Local Development Setup

For local testing before deploying:

### Create Local .env File

```bash
# backend/.env (not committed to git)
DB_URL=jdbc:mysql://localhost:1532/bbj?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=fire@1532
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=benjaminbuckmanjunior@gmail.com
MAIL_PASSWORD=vjmq iepu yhdd pjrx
B2_KEY_ID=5be753f9e33f
B2_APP_KEY=K005uAur9WX0YGfPwOwbdyCsVwKOhuA
```

### Run Backend Locally

```bash
# Windows
set /p DB_URL=<.env | findstr DB_URL
# Or manually set in application.properties

# macOS/Linux
export $(cat .env | xargs)
```

### Run Frontend Locally

```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`

---

## Part 6: Configuration Files

### application.properties (Development)

Located at: `backend/src/main/resources/application.properties`

Uses environment variables with defaults:
- `${MAIL_HOST:smtp.gmail.com}` - Falls back to smtp.gmail.com if not set
- `${DB_URL:jdbc:mysql://localhost:1532/bbj?...}` - Falls back to local MySQL

### application-production.properties (Production)

Located at: `backend/src/main/resources/application-production.properties`

Requires ALL environment variables to be set (no defaults):
- `${DB_URL}` - No fallback (must be set on Render)
- `${MAIL_USERNAME}` - No fallback (must be set on Render)
- `${MAIL_PASSWORD}` - No fallback (must be set on Render)

### Example Files

- `backend/src/main/resources/application.properties.example`
- `backend/src/main/resources/application-production.properties.example`

These show the structure without exposing actual credentials.

---

## Part 7: Troubleshooting Deployment

### View Render Logs

```bash
# In Render Dashboard
Services → [Your Service] → Logs
```

Common log errors:

1. **Database connection refused**
   ```
   ERROR: Failed to connect to mysql host
   ```
   Solution: Verify DB_URL, username, password

2. **Email service not initialized**
   ```
   ERROR: No mailSender bean found
   ```
   Solution: Set MAIL_USERNAME and MAIL_PASSWORD

3. **File upload failing**
   ```
   ERROR: B2 authentication failed
   ```
   Solution: Verify B2_KEY_ID and B2_APP_KEY

### Restart Service

1. Go to **Settings** → **Danger Zone**
2. Click **Restart**
3. Check logs for startup messages

---

## Configuration Summary Table

| Variable | Development Default | Production Required | Notes |
|----------|-------------------|-------------------|-------|
| `PORT` | 8080 | 8080 | Render sets automatic |
| `DB_URL` | localhost:1532 | TiDB Cloud | Must include ?useSSL=true for TiDB |
| `DB_USERNAME` | root | TiDB username | Format: xxxxx@bbj |
| `DB_PASSWORD` | fire@1532 | TiDB password | From TiDB connection string |
| `MAIL_HOST` | smtp.gmail.com | smtp.gmail.com | Gmail SMTP server |
| `MAIL_PORT` | 587 | 587 | Gmail SMTP port (TLS) |
| `MAIL_USERNAME` | [placeholder] | Gmail account | Must enable 2FA for app password |
| `MAIL_PASSWORD` | [placeholder] | App password | 16-char from Google Account |
| `B2_KEY_ID` | [placeholder] | B2 key | From Backblaze dashboard |
| `B2_APP_KEY` | [placeholder] | B2 app key | From Backblaze dashboard |

---

## Next Steps

After successful deployment:

1. **Test all features** (registration, login, file upload, etc.)
2. **Monitor logs** for any errors
3. **Configure custom domain** (if needed)
4. **Set up monitoring** (Render provides uptime checks)
5. **Backup database regularly** (TiDB Cloud automated backups)

For additional support, refer to:
- [Render Documentation](https://render.com/docs)
- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Backblaze B2 Documentation](https://www.backblaze.com/b2/docs/)

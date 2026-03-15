# EcclesiaSys - Render Environment Variables Quick Setup

**Copy all these values into Render Dashboard → Environment Variables**

## Backend Service Environment Variables

```
DB_URL=jdbc:mysql://[TIDB_HOST]:[TIDB_PORT]/[DATABASE_NAME]?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=[TIDB_USERNAME]
DB_PASSWORD=[TIDB_PASSWORD]
PORT=8080
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=benjaminbuckmanjunior@gmail.com
# Use a Gmail App Password stored in Render environment variables (do not commit)
MAIL_PASSWORD=[GMAIL_APP_PASSWORD]
B2_KEY_ID=[B2_KEY_ID]
B2_APP_KEY=[B2_APP_KEY]
```

## Instructions

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Select Backend Service** (e.g., "bbj-digital-api")
3. **Click Settings** → **Environment**
4. **Add each environment variable** from list above
5. **Update with actual values**:
   - Replace `3jxxxxxx4yyyyy@bbj` with your TiDB username
   - Replace `your-tidb-password-here` with your TiDB password
   - Verify other credentials match your setup
6. **Click Save** 
7. **Go to Deploy** → **Deploy latest commit**
8. **Wait for deployment** to complete (check logs)

## Where to Find Values

| Variable | Where to Get It |
|----------|-----------------|
| `DB_URL` | TiDB Cloud → Databases → Connection → Spring Boot |
| `DB_USERNAME` | TiDB Cloud → Databases → Connection → Username |
| `DB_PASSWORD` | TiDB Cloud → Password (you set during creation) |
| `MAIL_USERNAME` | Your Gmail address |
| `MAIL_PASSWORD` | Gmail App Passwords (Google Account → Security → App Passwords) |
| `B2_KEY_ID` | Backblaze B2 → Application Keys → Key ID |
| `B2_APP_KEY` | Backblaze B2 → Application Keys → App Key |

## Verify Deployment

After deployment completes, check logs for:

- ✅ "Started Application" - Backend started successfully
- ✅ "HibernateJpaVendorAdapter" - Database schema initialized
- ✅ "MailSenderImpl" - Email service initialized
- ✅ "No errors" in database connection logs

## If Something Goes Wrong

1. **Check Render Logs**: Settings → Logs → View full logs
2. **Restart Service**: Settings → Danger Zone → Restart
3. **Check Environment Variables**: Are they all set correctly?
4. **Test Locally First**: Add variables to `application.properties` and test locally

## Email Testing

Once deployed:
1. Register a new member
2. Use "Forgot Password" feature
3. Email should arrive in member's inbox
4. If not arriving, check email configuration in logs

For detailed instructions, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

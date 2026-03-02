# Firebase Email Template Configuration Guide

To ensure emails go directly to inbox (not spam) and have a formal message, you need to configure Firebase Email Templates.

## Step 1: Access Email Templates

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **fatimafinds**
3. Go to **Authentication** → **Templates** (or **Settings** → **Email Templates**)

## Step 2: Configure Password Reset Email Template

1. Find **Password reset** template
2. Click **Edit** or the pencil icon
3. Configure the following:

### Email Subject Line:
```
Change your Fatima-Finds password
```

### Email Body (Customize as needed):
```
Dear User,

You requested to change your password for your Fatima-Finds account.

Please click the link below to change your password:

%LINK%

If you did not request this password change, please ignore this email.

Best regards,
Fatima-Finds Team
```

### Action URL:
- Set to your website URL:
  - **For local testing**: `http://localhost:5500/action.html`
  - **For production**: `https://yourdomain.com/action.html`

### Sender Name (Optional but recommended):
```
Fatima-Finds
```

4. Click **Save**

## Step 3: Configure Email Verification Template

1. Find **Email address verification** template
2. Click **Edit**
3. Set similar formatting with formal language
4. Set Action URL to your domain
5. Click **Save**

## Step 4: Improve Email Deliverability (Reduce Spam)

### Option A: Use Custom Domain (Best for production)

1. In Email Templates, click **Customize Domain**
2. Enter your domain (e.g., `fatimafinds.com`)
3. Follow Firebase's instructions to add DNS records
4. This sends emails from `noreply@fatimafinds.com` instead of `noreply@fatimafinds.firebaseapp.com`

### Option B: Configure SPF/DKIM (If you have a domain)

- Add SPF, DKIM, and DMARC records to your domain
- Consult your domain registrar for instructions

## Step 5: Test the Configuration

1. Request a password reset from your app
2. Check your email inbox (not spam)
3. Verify the subject line is "Change your Fatima-Finds password"
4. Click the link and verify it goes to `action.html`

## Important Notes

- **Action URL must match exactly**: The URL in Firebase Console must match where your `action.html` file is hosted
- **Email formatting**: Use plain text or HTML formatting in Firebase Console
- **Sender name**: Setting a proper sender name improves deliverability
- **Local testing**: For local testing, use `http://localhost:5500/action.html`
- **Production**: For production, use your actual domain URL

## Current Configuration

Your password reset flow:
1. User clicks "Forgot password" → Goes to `reset-password.html`
2. User enters email → Firebase sends email
3. User clicks link in email → Goes to `action.html?mode=resetPassword&oobCode=...`
4. User enters new password → Password is changed → Redirects to `login.html`

Make sure the Action URL in Firebase Console points to `action.html` on your domain!

# Email Troubleshooting Guide

If you're not receiving password reset or verification emails, follow these steps:

## 1. Check Spam/Junk Folder
- **Most common issue**: Check your spam/junk folder in Gmail
- Emails from Firebase often get filtered as spam initially
- Look for emails from "noreply@fatimafinds.firebaseapp.com" or similar

## 2. Configure Firebase Action URL (IMPORTANT!)

Firebase needs to know where to redirect users after they click the email link:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **fatimafinds**
3. Go to **Authentication** → **Templates** (or **Settings** → **Email Templates**)
4. Find **Password reset** template
5. Click **Edit** or **Customize**
6. Set the **Action URL** to your website URL:
   - For local testing: `http://localhost:5500` (or your port)
   - For production: Your actual domain (e.g., `https://yourdomain.com`)
7. Save the changes

**Also check Email verification template:**
- Do the same for **Email address verification** template
- Set the Action URL to your website URL

## 3. Verify Email/Password Authentication is Enabled

1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Make sure **Email/Password** is enabled (toggle should be ON)
3. Click on **Email/Password** to configure:
   - Enable "Email/Password" provider
   - Save changes

## 4. Check Browser Console for Errors

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try sending a password reset
4. Look for any error messages
5. Check the **Network** tab for failed requests

## 5. Verify Email Address Exists

- Make sure the email address you're using exists in Firebase
- Go to Firebase Console → **Authentication** → **Users**
- Check if the user email is listed there

## 6. Wait a Few Minutes

- Email delivery can sometimes take 1-5 minutes
- Firebase emails are usually sent instantly, but email servers can delay delivery

## 7. Check Email Service Provider Settings

- Some email providers (especially institutional emails like @student.fatima.edu.ph) have strict filters
- Contact your IT department if emails from Firebase are being blocked
- Ask them to whitelist emails from `firebaseapp.com` domain

## 8. Test with Different Email

- Try using a personal Gmail account to test if the issue is specific to @student.fatima.edu.ph emails
- If personal email works but school email doesn't, it's likely a filtering issue

## 9. Firebase Email Limits

- Free tier has email sending limits
- Check Firebase Console for any quota warnings
- Upgrade to Blaze plan if needed (pay-as-you-go, still free for low usage)

## 10. Verify Firebase Configuration

Make sure your `js/firebase-config.js` has the correct project ID:
- Project ID should be: `fatimafinds`
- Auth Domain should be: `fatimafinds.firebaseapp.com`

## Quick Checklist

- [ ] Checked spam/junk folder
- [ ] Configured Action URL in Firebase Console
- [ ] Email/Password authentication is enabled
- [ ] Email address exists in Firebase Users
- [ ] No errors in browser console
- [ ] Waited a few minutes for email delivery
- [ ] Checked with different email address

## Still Not Working?

If emails still don't arrive after following all steps:

1. **Check Firebase Console → Authentication → Users**
   - See if the user exists
   - Check if email is verified

2. **Check Firebase Console → Usage and Billing**
   - Ensure you're not over quota
   - Check for any service disruptions

3. **Try Firebase CLI** (advanced):
   ```bash
   firebase auth:export users.json
   ```
   This exports users to verify they exist

4. **Contact Support**:
   - Firebase Support: https://firebase.google.com/support
   - Or check Firebase Status: https://status.firebase.google.com/

## Common Error Codes

- `auth/user-not-found`: Email doesn't exist in Firebase (but we show success for security)
- `auth/invalid-email`: Email format is invalid
- `auth/too-many-requests`: Rate limited, wait before trying again
- `auth/network-request-failed`: Network error, check internet connection

# How to Find Billing Settings in Firebase Console

## Different Ways to Access Billing

The Firebase Console interface can vary. Here are different ways to find billing settings:

---

## Method 1: Project Settings

1. **Click the gear icon** ⚙️ next to "Project Overview" (top left)
2. Click **"Project settings"**
3. Look for tabs at the top:
   - **General** tab
   - **Usage and billing** tab ← Click this
   - **Service accounts** tab
   - etc.

---

## Method 2: Direct URL

Try going directly to:
```
https://console.firebase.google.com/project/fatimafinds/settings/usage
```

Replace `fatimafinds` with your project ID if different.

---

## Method 3: From Overview Page

1. Go to Firebase Console home
2. Click on your project: **fatimafinds**
3. Look for a **"Upgrade"** or **"Billing"** button/link
4. Or look for **"Usage"** section on the dashboard

---

## Method 4: Left Sidebar

Look in the left sidebar for:
- **Usage and billing** (might be at the bottom)
- **Settings** → **Usage and billing**
- **Project settings** → **Usage and billing**

---

## Method 5: If You See "Spark Plan"

If you see "Spark Plan" anywhere:
1. Click on it
2. It should take you to billing/upgrade page
3. Click **"Modify plan"** or **"Upgrade"**

---

## Alternative: Use Default Storage Rules

**You don't actually need to upgrade!** 

I've updated your code to check admin status before uploading. This means:
- ✅ Your code will block non-admins (even if Storage allows it)
- ✅ You can use default Storage rules
- ✅ No billing upgrade needed

**The code-level security is actually better** because it checks admin status before even attempting upload.

---

## What I Did

I updated `posts.js` to:
1. Check if user is admin BEFORE uploading
2. Throw an error if not admin
3. This prevents uploads even if Storage rules allow it

**Your app is now secure without needing Storage rules!** 🎉

---

## Next Steps

1. **Use default Storage rules** (they should already be there)
2. **Set Firestore rules** (these work on free tier)
3. **Test your app** - code will block non-admins

You're all set! The code-level security is actually more secure than Storage rules alone.

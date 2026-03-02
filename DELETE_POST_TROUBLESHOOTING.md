# Delete Post Permission Error - Troubleshooting

## Error: "Missing or insufficient permissions"

This error means Firestore security rules are blocking the delete operation. Here's how to fix it:

---

## Step 1: Verify Firestore Rules Are Published

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `fatimafinds`

2. **Check Firestore Rules**
   - Click **Firestore Database** → **Rules** tab
   - Make sure the rules match `FIRESTORE_RULES.txt`
   - **Click "Publish"** if you see any changes

3. **Verify Delete Rule**
   The delete rule should look like this:
   ```javascript
   allow delete: if request.auth != null && 
                    exists(/databases/$(database)/documents/foundAdmins/$(request.auth.uid)) &&
                    get(/databases/$(database)/documents/foundAdmins/$(request.auth.uid)).data.isAdmin == true;
   ```

---

## Step 2: Verify Admin Account Setup

1. **Check if you're logged in as admin**
   - Make sure you're logged in with an admin account
   - Check the auth status badge (should say "Admin Mode")

2. **Verify Admin in Firestore**
   - Go to **Firestore Database** → **Data** tab
   - Look for collection: `foundAdmins`
   - Find document with your User UID
   - Verify it has field: `isAdmin: true` (boolean)

3. **How to find your User UID:**
   - Go to **Authentication** → **Users**
   - Find your email
   - Copy the UID (long string of characters)

4. **Create Admin Document (if missing):**
   - Go to **Firestore Database** → **Data**
   - Click **Start collection** (if `foundAdmins` doesn't exist)
   - Collection ID: `foundAdmins`
   - Document ID: [Your User UID]
   - Add field:
     - Field: `isAdmin`
     - Type: `boolean`
     - Value: `true`
   - Click **Save**

---

## Step 3: Test Admin Status

Open browser console (F12) and run:
```javascript
// This will check if you're recognized as admin
// (You need to be on the found page)
```

Or check the page - you should see:
- "Admin Mode" badge
- Post creation form visible
- Delete buttons on posts

---

## Step 4: Common Issues

### Issue 1: Rules Not Published
**Solution:** Go to Firestore Rules and click "Publish"

### Issue 2: Wrong Collection Name
**Solution:** Make sure it's `foundAdmins` (not `admins` or `foundAdmin`)

### Issue 3: Wrong Field Type
**Solution:** `isAdmin` must be `boolean` type, value `true` (not string "true")

### Issue 4: User Not Logged In
**Solution:** Make sure you're logged in with the admin account

### Issue 5: Cache Issue
**Solution:** Clear browser cache or try incognito mode

---

## Step 5: Quick Fix - Simplified Rules (Temporary)

If you want to test quickly, you can temporarily use simpler rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /foundPosts/{postId} {
      allow read: if true;
      allow create, delete: if request.auth != null;
      allow update: if false;
    }
    
    match /foundAdmins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
  }
}
```

**⚠️ Warning:** This allows any logged-in user to delete. Only use for testing!

---

## Step 6: Verify Everything Works

1. ✅ Rules published in Firestore
2. ✅ Admin document exists in `foundAdmins` collection
3. ✅ `isAdmin` field is `true` (boolean)
4. ✅ Logged in with admin account
5. ✅ See "Admin Mode" badge on page
6. ✅ Delete buttons visible on posts

---

## Still Not Working?

1. **Check browser console** for detailed error messages
2. **Verify you're using the correct project** in Firebase Console
3. **Try logging out and back in**
4. **Clear admin cache** (the code does this automatically on logout)

---

## Need Help?

If it still doesn't work, check:
- Browser console errors (F12)
- Firebase Console → Firestore → Rules (for syntax errors)
- Make sure you're on the Blaze plan (if Storage rules were set)

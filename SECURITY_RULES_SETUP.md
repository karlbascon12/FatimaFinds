# How to Set Up Security Rules in Firebase

## What Are Security Rules?

Security rules are like bouncers for your database and storage. They control:
- **Who can read data** (view posts/images)
- **Who can write data** (create posts/upload images)
- **What data they can access**

## ⚠️ IMPORTANT: You Need BOTH Rules!

Firebase has **2 separate services** that need their own rules:

1. **Firestore Rules** → Protects your **database** (post text, author info, etc.)
2. **Storage Rules** → Protects your **file storage** (images, photos)

**You MUST set up BOTH** because:
- Posts are stored in **Firestore** (database)
- Images are stored in **Storage** (file storage)
- They are separate systems with separate security

Think of it like:
- Firestore = Your filing cabinet (text data)
- Storage = Your photo album (image files)

Both need locks! 🔒

## Why We Need These Rules

Without security rules, anyone could:
- ❌ Delete all your posts
- ❌ Upload malicious files
- ❌ Access private data
- ❌ Spam your database

With security rules:
- ✅ Only admins can post
- ✅ Everyone can view (no login needed)
- ✅ Your data is protected

---

## Step 1: Set Up Firestore Security Rules

### What is Firestore?
Firestore is your **database** - it stores:
- Post text/content
- Author information
- Post dates
- Post metadata

### What These Rules Do:
1. **foundPosts collection**: 
   - ✅ Anyone can READ posts (no login needed)
   - ✅ Only admins can CREATE posts
   - ❌ No one can UPDATE or DELETE posts

2. **foundAdmins collection**:
   - ✅ Users can only check their OWN admin status
   - ❌ No one can modify admin list (only via console)

### How to Set Them Up:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `fatimafinds`

2. **Navigate to Firestore**
   - Click "Firestore Database" in left sidebar
   - Click on the "Rules" tab (at the top)

3. **Copy and Paste the Rules**
   - Open the file `FIRESTORE_RULES.txt` I created
   - Copy ALL the content
   - Paste it into the rules editor (replace everything)
   - Click "Publish" button

4. **Verify**
   - You should see a green checkmark ✅
   - Rules are now active!

---

## Step 2: Set Up Storage Security Rules

### What is Storage?
Storage is your **file storage** - it stores:
- Images/photos uploaded with posts
- Any files users upload

### What These Rules Do:
1. **found-posts folder**:
   - ✅ Anyone can VIEW images (no login needed)
   - ✅ Only admins can UPLOAD images

### How to Set Them Up:

1. **Go to Firebase Console**
   - Still in your project: `fatimafinds`

2. **Navigate to Storage**
   - Click "Storage" in left sidebar
   - Click on the "Rules" tab (at the top)

3. **Copy and Paste the Rules**
   - Open the file `STORAGE_RULES.txt` I created
   - Copy ALL the content
   - Paste it into the rules editor (replace everything)
   - Click "Publish" button

4. **Verify**
   - You should see a green checkmark ✅
   - Rules are now active!

---

## Understanding the Rules (Detailed)

### Firestore Rules Breakdown:

```javascript
// Rule 1: Found Posts
match /foundPosts/{postId} {
  allow read: if true;
  // ↑ Anyone can read (even without login)
  
  allow create: if request.auth != null && 
                   exists(/databases/$(database)/documents/foundAdmins/$(request.auth.uid)) &&
                   get(/databases/$(database)/documents/foundAdmins/$(request.auth.uid)).data.isAdmin == true;
  // ↑ Only logged-in users who are admins can create posts
  
  allow update, delete: if false;
  // ↑ No one can update or delete (for safety)
}
```

### Storage Rules Breakdown:

```javascript
match /found-posts/{userId}/{allPaths=**} {
  allow read: if true;
  // ↑ Anyone can view images (no login needed)
  
  allow write: if request.auth != null && 
                  firestore.get(/databases/(default)/documents/foundAdmins/$(request.auth.uid)).data.isAdmin == true;
  // ↑ Only logged-in admins can upload images
}
```

---

## Testing Your Rules

### Test 1: Public Access (Should Work)
- ✅ Open found.html in incognito/private window (not logged in)
- ✅ You should be able to SEE posts
- ✅ You should NOT see the post form

### Test 2: Regular User (Should NOT Post)
- ✅ Log in with a regular account (not admin)
- ✅ You should be able to SEE posts
- ✅ You should NOT see the post form
- ❌ If you try to post via code, it should fail

### Test 3: Admin User (Should Post)
- ✅ Log in with an admin account
- ✅ You should see the post form
- ✅ You should be able to create posts with images

---

## Troubleshooting

### Error: "Missing or insufficient permissions"
- Check that you copied the rules correctly
- Make sure you clicked "Publish"
- Wait a few seconds for rules to propagate

### Error: "Permission denied"
- Verify the user is in the `foundAdmins` collection
- Check that `isAdmin` field is set to `true`
- Make sure the user is logged in

### Rules Not Working?
- Clear browser cache
- Check Firebase Console for rule syntax errors
- Verify your project ID matches

---

## Important Notes

⚠️ **Default Rules Are Dangerous!**
- Firebase starts with rules that allow everything
- You MUST replace them with secure rules
- Never leave default rules in production

✅ **Best Practices:**
- Test rules in development first
- Use Firebase Emulator for testing
- Review rules regularly
- Keep backups of your rules

---

## Quick Reference

**Files I Created:**
- `FIRESTORE_RULES.txt` - Copy this for Firestore
- `STORAGE_RULES.txt` - Copy this for Storage

**Where to Paste:**
- Firestore: Console → Firestore Database → Rules tab
- Storage: Console → Storage → Rules tab

**After Pasting:**
- Click "Publish" button
- Wait for confirmation ✅

# Admin Account Setup Guide

## Setting Up Admin Accounts in Firestore

Since admin accounts are now stored securely in Firestore (not in code), you need to set them up in your Firebase Console.

### Steps to Add an Admin Account:

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com
   - Select your project: `fatimafinds`

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Make sure you're in the "Data" tab

3. **Create the Admin Collection**
   - Click "Start collection" (if it doesn't exist)
   - Collection ID: `foundAdmins`
   - Click "Next"

4. **Add Admin Document**
   - Document ID: Use the **User UID** from Firebase Authentication
     - To find the UID: Go to Authentication → Users → Find the user → Copy their UID
   - Add a field:
     - Field: `isAdmin`
     - Type: `boolean`
     - Value: `true`
   - Click "Save"

### Example Document Structure:

```
Collection: foundAdmins
Document ID: [User UID from Authentication]
Fields:
  - isAdmin: true (boolean)
```

### Security Rules (Important!)

Make sure your Firestore Security Rules protect the admin collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Found posts - readable by all, writable by admins only
    match /foundPosts/{postId} {
      allow read: if true; // Anyone can read
      allow create: if request.auth != null && 
                       exists(/databases/$(database)/documents/foundAdmins/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/foundAdmins/$(request.auth.uid)).data.isAdmin == true;
      allow update, delete: if false; // No updates/deletes for now
    }
    
    // Admin collection - only readable by authenticated users checking their own status
    match /foundAdmins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only admins can write via console
    }
  }
}
```

### Storage Rules

For image uploads, add these Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /found-posts/{userId}/{allPaths=**} {
      allow read: if true; // Anyone can view images
      allow write: if request.auth != null && 
                      firestore.get(/databases/(default)/documents/foundAdmins/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### Adding Multiple Admins

Repeat step 4 for each admin account you want to add. Each admin needs:
- Their User UID from Authentication
- A document in `foundAdmins` collection with `isAdmin: true`

### Security Notes

- ✅ Admin accounts are now stored in Firestore, not in code
- ✅ Cannot be edited by viewing HTML source
- ✅ Requires Firebase Authentication
- ✅ Protected by Firestore Security Rules
- ✅ Passwords are handled securely by Firebase Auth

### Testing

1. Create a test user account through your signup page
2. Add their UID to the `foundAdmins` collection
3. Log in with that account
4. You should see the "Create New Post" form on the Found page

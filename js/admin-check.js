// Admin check utility for found page
// Admins are stored securely in Firestore - not in code

import { db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getCurrentUser } from './auth.js';

// Cache for admin status to reduce Firestore reads
const adminCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check if current user is an admin (Firestore only - secure)
export async function isAdmin() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return false;
    }

    // Check cache first
    const cached = adminCache.get(user.uid);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.isAdmin;
    }

    // Check Firestore for admin status
    try {
      const adminDoc = await getDoc(doc(db, 'foundAdmins', user.uid));
      const isAdminUser = adminDoc.exists() && adminDoc.data().isAdmin === true;
      
      // Cache the result
      adminCache.set(user.uid, {
        isAdmin: isAdminUser,
        timestamp: Date.now()
      });
      
      return isAdminUser;
    } catch (error) {
      console.error('Error checking admin status in Firestore:', error);
      return false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Clear admin cache (useful after logout)
export function clearAdminCache() {
  adminCache.clear();
}

// Clear cache for specific user
export function clearUserAdminCache(uid) {
  adminCache.delete(uid);
}

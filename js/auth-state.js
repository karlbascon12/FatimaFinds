// Authentication state management for protected pages

import { onAuthStateChange, getCurrentUser } from './auth.js';

// Check if user is logged in and redirect if not
export function requireAuth(redirectTo = 'login.html') {
  onAuthStateChange((user) => {
    if (!user && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
      window.location.href = redirectTo;
    }
  });
}

// Get current user info
export function getAuthUser() {
  return getCurrentUser();
}

// Check auth state (non-blocking)
export function checkAuthState() {
  return new Promise((resolve) => {
    onAuthStateChange((user) => {
      resolve(user);
    });
  });
}

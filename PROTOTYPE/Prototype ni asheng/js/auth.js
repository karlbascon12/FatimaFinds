// Authentication utilities

import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Check if user is authenticated
export function checkAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });
}

// Sign up with email and password
export async function signUp(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    if (displayName) {
      await updateProfile(user, { displayName: displayName });
    }
    
    // Send email verification
    try {
      await sendEmailVerification(user);
    } catch (verificationError) {
      console.error('Error sending verification email:', verificationError);
      // Don't fail signup if verification email fails, but log it
    }
    
    return { success: true, user: user };
  } catch (error) {
    let errorMessage = 'An error occurred during sign up.';
    
    // User-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    } else {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Send email verification
export async function sendVerificationEmail() {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user is currently signed in.' };
    }
    
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Failed to send verification email.';
    
    if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    } else {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Sign in with email and password
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = 'An error occurred during sign in.';
    
    // User-friendly error messages
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Send password reset email
export async function sendPasswordReset(email) {
  try {
    // Validate email domain
    const allowedDomain = '@student.fatima.edu.ph';
    if (!email.endsWith(allowedDomain)) {
      return { 
        success: false, 
        error: `Only email addresses ending with ${allowedDomain} are allowed.` 
      };
    }

    await sendPasswordResetEmail(auth, email);
    
    console.log('Password reset email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error code:', error.code, 'Message:', error.message);
    
    let errorMessage = 'Failed to send password reset email.';
    
    // User-friendly error messages
    if (error.code === 'auth/user-not-found') {
      // Don't reveal that user doesn't exist for security
      errorMessage = 'If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder.';
      return { success: true, message: errorMessage }; // Return success to prevent email enumeration
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    } else {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Verify password reset code from email link
export async function verifyResetCode(actionCode) {
  try {
    const email = await verifyPasswordResetCode(auth, actionCode);
    return { success: true, email: email };
  } catch (error) {
    let errorMessage = 'Invalid or expired reset link.';
    
    if (error.code === 'auth/expired-action-code') {
      errorMessage = 'This password reset link has expired. Please request a new one.';
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'This password reset link is invalid. Please request a new one.';
    }
    
    return { success: false, error: errorMessage };
  }
}

// Confirm password reset with new password
export async function confirmPasswordResetAction(actionCode, newPassword) {
  try {
    await confirmPasswordReset(auth, actionCode, newPassword);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Failed to reset password.';
    
    if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    } else if (error.code === 'auth/expired-action-code') {
      errorMessage = 'This password reset link has expired. Please request a new one.';
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'This password reset link is invalid. Please request a new one.';
    } else {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

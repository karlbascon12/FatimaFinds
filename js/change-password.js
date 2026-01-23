// Change password page functionality (for password reset from email link)

import { verifyResetCode, confirmPasswordResetAction } from './auth.js';

const changePasswordForm = document.getElementById('changePasswordForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const submitButton = changePasswordForm.querySelector('button[type="submit"]');

// Get the action code from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const actionCode = urlParams.get('oobCode');
const mode = urlParams.get('mode');

let isValidCode = false;
let userEmail = '';

// Verify the action code on page load
async function initializePage() {
  if (!actionCode || mode !== 'resetPassword') {
    showError('Invalid or missing reset link. Please request a new password reset link.');
    changePasswordForm.style.display = 'none';
    return;
  }

  // Verify the reset code
  const result = await verifyResetCode(actionCode);
  
  if (result.success) {
    isValidCode = true;
    userEmail = result.email;
    console.log('Reset code verified for:', userEmail);
  } else {
    showError(result.error);
    changePasswordForm.style.display = 'none';
  }
}

// Initialize on page load
initializePage();

changePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!isValidCode) {
    showError('Invalid reset link. Please request a new password reset.');
    return;
  }
  
  // Reset messages
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
  
  // Get form values
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate passwords match
  if (newPassword !== confirmPassword) {
    showError('Passwords do not match. Please try again.');
    return;
  }
  
  // Validate password length
  if (newPassword.length < 6) {
    showError('Password must be at least 6 characters long.');
    return;
  }
  
  // Disable button and show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Changing Password...';
  
  // Confirm password reset
  const result = await confirmPasswordResetAction(actionCode, newPassword);
  
  if (result.success) {
    // Show success message
    showSuccess('Password changed successfully! Redirecting to login...');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } else {
    // Show error message
    submitButton.disabled = false;
    submitButton.textContent = 'Change Password';
    showError(result.error || 'Failed to change password. Please try again.');
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
}

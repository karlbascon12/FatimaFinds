// Password reset page functionality

import { sendPasswordReset } from './auth.js';

const resetPasswordForm = document.getElementById('resetPasswordForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const submitButton = resetPasswordForm.querySelector('button[type="submit"]');

resetPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Reset messages
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
  
  // Get form values
  const email = document.getElementById('email').value.trim();
  
  // Disable button and show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  
  // Send password reset email
  const result = await sendPasswordReset(email);
  
  if (result.success) {
    // Show success message
    showSuccess(result.message || 'Password reset link has been sent to your email. Please check your inbox (@student.fatima.edu.ph), including spam/junk folder, and follow the instructions to reset your password.');
    
    // Clear the form
    resetPasswordForm.reset();
    
    // Reset button after a delay
    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Reset Link';
    }, 3000);
  } else {
    // Show error message
    submitButton.disabled = false;
    submitButton.textContent = 'Send Reset Link';
    
    // Log error to console for debugging
    console.error('Password reset error:', result.error);
    
    showError(result.error || 'Failed to send password reset email. Please try again.');
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

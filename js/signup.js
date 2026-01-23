// Signup page functionality

import { signUp } from './auth.js';

const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const submitButton = signupForm.querySelector('button[type="submit"]');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Reset messages
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
  
  // Get form values
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate email domain
  const allowedDomain = '@student.fatima.edu.ph';
  if (!email.endsWith(allowedDomain)) {
    showError(`Only email addresses ending with ${allowedDomain} are allowed.`);
    return;
  }
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showError('Passwords do not match. Please try again.');
    return;
  }
  
  // Validate password length
  if (password.length < 6) {
    showError('Password must be at least 6 characters long.');
    return;
  }
  
  // Disable button and show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Creating Account...';
  
  // Sign up user
  const result = await signUp(email, password, name);
  
  if (result.success) {
    // Show success message with email verification info
    showSuccess('Account created successfully! Please check your email (@student.fatima.edu.ph) for a verification link. You can verify your email later.');
    
    // Redirect to home page after a longer delay to let user read the message
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 4000);
  } else {
    // Show error message
    submitButton.disabled = false;
    submitButton.textContent = 'Create Account';
    showError(result.error || 'Failed to create account. Please try again.');
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

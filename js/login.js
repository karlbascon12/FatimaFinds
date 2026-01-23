// Login page functionality

import { signIn } from './auth.js';

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const submitButton = loginForm.querySelector('button[type="submit"]');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Reset error message
  if (errorMessage) {
    errorMessage.style.display = 'none';
  }
  
  // Get form values
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  // Validate email domain
  const allowedDomain = '@student.fatima.edu.ph';
  if (!email.endsWith(allowedDomain)) {
    submitButton.disabled = false;
    submitButton.textContent = 'Sign In';
    
    if (errorMessage) {
      errorMessage.textContent = `Only email addresses ending with ${allowedDomain} are allowed.`;
      errorMessage.style.display = 'block';
    } else {
      alert(`Only email addresses ending with ${allowedDomain} are allowed.`);
    }
    return;
  }
  
  // Disable button and show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Signing In...';
  
  // Sign in user
  const result = await signIn(email, password);
  
  if (result.success) {
    // Redirect to home page
    window.location.href = 'home.html';
  } else {
    // Show error message
    submitButton.disabled = false;
    submitButton.textContent = 'Sign In';
    
    if (errorMessage) {
      errorMessage.textContent = result.error || 'Failed to sign in. Please try again.';
      errorMessage.style.display = 'block';
    } else {
      alert(result.error || 'Failed to sign in. Please try again.');
    }
  }
});

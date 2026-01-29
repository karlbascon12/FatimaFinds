// Navigation with authentication state

import { onAuthStateChange, signOutUser } from './auth.js';

// Get base path for navigation links
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    return '../';
  }
  return '';
}

// Update navigation based on auth state
export function updateNavigation() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const basePath = getBasePath();

  onAuthStateChange((user) => {
    // Remove existing auth links
    const existingAuthLink = navLinks.querySelector('.auth-link');
    if (existingAuthLink) {
      existingAuthLink.remove();
    }

    // Add login/logout link
    const authLink = document.createElement('a');
    if (user) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.classList.add('auth-link');
      authLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const result = await signOutUser();
        if (result.success) {
          window.location.href = basePath + 'index.html';
        }
      });
    } else {
      authLink.textContent = 'Login';
      authLink.href = basePath + 'login.html';
      authLink.classList.add('auth-link');
    }
    
    navLinks.appendChild(authLink);
  });
}

// Initialize navigation on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
  updateNavigation();
}

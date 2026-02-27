// Main functionality for found page
// Professional, optimized, and interactive

import { onAuthStateChange, getCurrentUser } from './auth.js';
import { isAdmin, clearAdminCache } from './admin-check.js';
import { createPost, subscribeToPosts, formatDate, deletePost } from './posts.js';

let unsubscribePosts = null;
let currentUser = null;
let isAdminUser = false;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializePage();
});

// Initialize page
async function initializePage() {
  // Check initial auth state
  const initialUser = getCurrentUser();
  if (initialUser) {
    currentUser = initialUser;
    isAdminUser = await isAdmin();
    updateUIForAuthState(true, isAdminUser);
  } else {
    updateUIForAuthState(false, false);
  }

  // Listen to auth state changes
  onAuthStateChange(async (user) => {
    currentUser = user;
    
    if (user) {
      // User is logged in - check admin status
      isAdminUser = await isAdmin();
      updateUIForAuthState(true, isAdminUser);
    } else {
      // User is not logged in
      isAdminUser = false;
      updateUIForAuthState(false, false);
      clearAdminCache();
    }
  });

  // Load posts (works for both logged in and logged out users)
  loadPosts();
}

// Update UI based on auth state
function updateUIForAuthState(isLoggedIn, isAdmin) {
  const postForm = document.getElementById('postForm');
  const loginPrompt = document.getElementById('loginPrompt');
  const authStatus = document.getElementById('authStatus');

  if (isAdmin) {
    // Show post form for admins
    if (postForm) {
      postForm.style.display = 'block';
      postForm.classList.add('fade-in');
    }
    if (loginPrompt) loginPrompt.style.display = 'none';
    if (authStatus) {
      authStatus.textContent = 'Admin Mode';
      authStatus.className = 'auth-status admin';
    }
  } else if (isLoggedIn) {
    // Hide form for regular users
    if (postForm) postForm.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'none';
    if (authStatus) {
      authStatus.textContent = 'Viewing as User';
      authStatus.className = 'auth-status user';
    }
  } else {
    // Not logged in
    if (postForm) postForm.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
    if (authStatus) {
      authStatus.textContent = 'Public View';
      authStatus.className = 'auth-status public';
    }
  }

  // Set up post form if admin
  if (isAdmin) {
    setupPostForm();
  }
}

// Set up post form
function setupPostForm() {
  const createPostForm = document.getElementById('createPostForm');
  if (!createPostForm) return;

  // Remove existing listener to avoid duplicates
  const newForm = createPostForm.cloneNode(true);
  createPostForm.parentNode.replaceChild(newForm, createPostForm);

  newForm.addEventListener('submit', handlePostSubmit);
  
  // Image preview
  const imageInput = document.getElementById('postImage');
  const imagePreview = document.getElementById('imagePreview');
  
  if (imageInput && imagePreview) {
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imagePreview.innerHTML = `
            <div class="image-preview-container">
              <img src="${event.target.result}" alt="Preview">
              <button type="button" class="remove-image" onclick="removeImagePreview()">×</button>
            </div>
          `;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Remove image preview
window.removeImagePreview = function() {
  const imagePreview = document.getElementById('imagePreview');
  const imageInput = document.getElementById('postImage');
  if (imagePreview) {
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
  }
  if (imageInput) imageInput.value = '';
};

// Handle post form submission
async function handlePostSubmit(e) {
  e.preventDefault();
  
  const textInput = document.getElementById('postText');
  const imageInput = document.getElementById('postImage');
  const postButton = document.getElementById('postButton');
  const errorMessage = document.getElementById('postError');
  const successMessage = document.getElementById('postSuccess');
  const progressBar = document.getElementById('uploadProgress');
  
  const text = textInput.value.trim();
  const imageFile = imageInput.files[0];

  // Validation
  if (!text && !imageFile) {
    showError('Please enter some text or upload an image.');
    return;
  }

  // Disable button and show loading
  if (postButton) {
    postButton.disabled = true;
    postButton.innerHTML = '<span class="spinner"></span> Posting...';
  }
  
  if (errorMessage) errorMessage.style.display = 'none';
  if (successMessage) successMessage.style.display = 'none';
  if (progressBar) {
    progressBar.style.display = 'block';
    progressBar.style.width = '0%';
  }

  // Create post with progress tracking
  const result = await createPost(text, imageFile, (progress) => {
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  });

  if (result.success) {
    // Show success message
    if (successMessage) {
      successMessage.textContent = 'Post created successfully!';
      successMessage.style.display = 'block';
      setTimeout(() => {
        if (successMessage) successMessage.style.display = 'none';
      }, 3000);
    }
    
    // Clear form
    textInput.value = '';
    imageInput.value = '';
    removeImagePreview();
    if (progressBar) progressBar.style.display = 'none';
  } else {
    // Show error
    showError(result.error || 'Failed to create post. Please try again.');
    if (progressBar) progressBar.style.display = 'none';
  }

  // Re-enable button
  if (postButton) {
    postButton.disabled = false;
    postButton.textContent = 'Post';
  }
}

// Show error message
function showError(message) {
  const errorMessage = document.getElementById('postError');
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.classList.add('shake');
    setTimeout(() => {
      if (errorMessage) {
        errorMessage.style.display = 'none';
        errorMessage.classList.remove('shake');
      }
    }, 5000);
  }
}

// Load and subscribe to posts
function loadPosts() {
  const postsContainer = document.getElementById('postsContainer');
  if (!postsContainer) return;

  // Show loading state with animation
  postsContainer.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading posts...</p>
    </div>
  `;

  // Subscribe to real-time updates
  unsubscribePosts = subscribeToPosts((result) => {
    if (result.success && result.posts) {
      displayPosts(result.posts);
    } else {
      postsContainer.innerHTML = `
        <div class="error-container">
          <p>Failed to load posts.</p>
          <button onclick="location.reload()" class="retry-button">Retry</button>
        </div>
      `;
    }
  }, 50);
}

// Display posts with smooth animations
function displayPosts(posts) {
  const postsContainer = document.getElementById('postsContainer');
  const postsCount = document.getElementById('postsCount');
  if (!postsContainer) return;

  // Update posts count
  if (postsCount) {
    postsCount.textContent = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`;
  }

  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="no-posts">
        <div class="no-posts-icon">📭</div>
        <p>No posts yet. Check back later!</p>
      </div>
    `;
    return;
  }

  // Use requestAnimationFrame for smooth rendering
  requestAnimationFrame(() => {
    postsContainer.innerHTML = posts.map((post, index) => `
      <article class="post-card fade-in-up" data-post-id="${post.id}" style="animation-delay: ${index * 0.03}s">
        <div class="post-header">
          <div class="post-author-info">
            <div class="author-avatar">${getInitials(post.authorName || post.authorEmail)}</div>
            <div>
              <div class="post-author">${escapeHtml(post.authorName || post.authorEmail.split('@')[0])}</div>
              <div class="post-date">${formatDate(post.createdAt)}</div>
            </div>
          </div>
          ${isAdminUser ? `
            <button class="delete-post-btn" data-post-id="${post.id}" title="Delete post">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          ` : ''}
        </div>
        ${post.text ? `<div class="post-text">${escapeHtml(post.text).replace(/\n/g, '<br>')}</div>` : ''}
        ${post.imageUrl ? `
          <div class="post-image-container">
            <img 
              src="${post.imageUrl}" 
              alt="Post image" 
              loading="lazy"
              class="post-image"
              onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EImage not available%3C/text%3E%3C/svg%3E';"
            >
          </div>
        ` : ''}
      </article>
    `).join('');
    
    // Add intersection observer for lazy loading images
    setupLazyLoading();
    
    // Setup delete buttons for admins
    if (isAdminUser) {
      setupDeleteButtons();
    }
  });
}

// Get user initials for avatar
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Setup lazy loading for images
function setupLazyLoading() {
  const images = document.querySelectorAll('.post-image');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px' }); // Start loading 50px before image is visible

    images.forEach(img => imageObserver.observe(img));
  }
}

// Setup delete buttons for admins
function setupDeleteButtons() {
  const deleteButtons = document.querySelectorAll('.delete-post-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const postId = button.getAttribute('data-post-id');
      const postCard = button.closest('.post-card');
      
      if (!postId || !postCard) return;
      
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
      }
      
      // Show loading state
      button.disabled = true;
      button.innerHTML = '<span class="spinner-small"></span>';
      postCard.style.opacity = '0.5';
      
      // Delete post
      const result = await deletePost(postId);
      
      if (result.success) {
        // Animate removal
        postCard.style.transition = 'all 0.3s ease-out';
        postCard.style.transform = 'translateX(-100%)';
        postCard.style.opacity = '0';
        
        setTimeout(() => {
          postCard.remove();
          // Update post count
          const postsCount = document.getElementById('postsCount');
          const remainingPosts = document.querySelectorAll('.post-card').length;
          if (postsCount) {
            postsCount.textContent = `${remainingPosts} ${remainingPosts === 1 ? 'post' : 'posts'}`;
          }
        }, 300);
      } else {
        // Show detailed error
        const errorMsg = result.error || 'Unknown error';
        let detailedError = 'Failed to delete post: ' + errorMsg;
        
        if (errorMsg.includes('permission') || errorMsg.includes('Permission')) {
          detailedError += '\n\nTroubleshooting:\n';
          detailedError += '1. Make sure Firestore rules are published\n';
          detailedError += '2. Verify your admin document exists in foundAdmins collection\n';
          detailedError += '3. Check that isAdmin field is set to true (boolean)\n';
          detailedError += '4. Try logging out and back in';
        }
        
        alert(detailedError);
        console.error('Delete post error:', result.error);
        
        button.disabled = false;
        button.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        `;
        postCard.style.opacity = '1';
      }
    });
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (unsubscribePosts) {
    unsubscribePosts();
  }
});

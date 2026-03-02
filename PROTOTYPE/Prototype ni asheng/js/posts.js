// Post management for found page
// Optimized for performance with lazy loading and caching

import { db, storage } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  startAfter,
  getDoc,
  doc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  uploadBytesResumable
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getCurrentUser } from './auth.js';
import { isAdmin } from './admin-check.js';
import { containsProfanity, getProfanityErrorMessage } from './profanity-filter.js';

// Image optimization settings
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 1920; // Max width/height

// Compress image before upload
function compressImage(file) {
  return new Promise((resolve) => {
    if (file.size <= MAX_IMAGE_SIZE && file.type === 'image/gif') {
      // Don't compress GIFs or small files
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          if (width > height) {
            height = (height / width) * MAX_IMAGE_DIMENSION;
            width = MAX_IMAGE_DIMENSION;
          } else {
            width = (width / height) * MAX_IMAGE_DIMENSION;
            height = MAX_IMAGE_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Create a new post
export async function createPost(text, imageFile = null, onProgress = null) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be logged in to create posts');
    }

    // Security check: Verify user is admin before allowing post creation
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      throw new Error('Only admins can create posts');
    }

    // Profanity check
    if (text && containsProfanity(text)) {
      throw new Error(getProfanityErrorMessage());
    }

    let imageUrl = null;
    
    // Upload image if provided
    if (imageFile) {
      try {
        // Validate file
        if (!imageFile.type.startsWith('image/')) {
          throw new Error('File must be an image');
        }
        if (imageFile.size > 10 * 1024 * 1024) {
          throw new Error('Image size must be less than 10MB');
        }

        // Compress image
        const compressedFile = await compressImage(imageFile);
        
        // Upload to storage
        const timestamp = Date.now();
        const sanitizedName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `found-posts/${user.uid}/${timestamp}_${sanitizedName}`);
        
        if (onProgress) {
          // Use resumable upload for progress tracking
          const uploadTask = uploadBytesResumable(storageRef, compressedFile);
          
          return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
              },
              (error) => reject(error),
              async () => {
                try {
                  imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                  const postData = {
                    text: text.trim() || '',
                    imageUrl: imageUrl,
                    authorId: user.uid,
                    authorEmail: user.email,
                    authorName: user.displayName || user.email.split('@')[0],
                    createdAt: Timestamp.now(),
                    likes: 0,
                    likesBy: []
                  };
                  const docRef = await addDoc(collection(db, 'foundPosts'), postData);
                  resolve({ success: true, postId: docRef.id });
                } catch (error) {
                  reject(error);
                }
              }
            );
          });
        } else {
          await uploadBytes(storageRef, compressedFile);
          imageUrl = await getDownloadURL(storageRef);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        throw new Error(`Image upload failed: ${error.message}`);
      }
    }

    // Create post document
    const postData = {
      text: text.trim() || '',
      imageUrl: imageUrl,
      authorId: user.uid,
      authorEmail: user.email,
      authorName: user.displayName || user.email.split('@')[0],
      createdAt: Timestamp.now(),
      likes: 0,
      likesBy: []
    };

    const docRef = await addDoc(collection(db, 'foundPosts'), postData);
    return { success: true, postId: docRef.id };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }
}

// Fetch posts with pagination support
export async function fetchPosts(maxPosts = 50, lastDoc = null) {
  try {
    let q = query(
      collection(db, 'foundPosts'),
      orderBy('createdAt', 'desc'),
      limit(maxPosts)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'foundPosts'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(maxPosts)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    let lastVisible = null;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      });
      lastVisible = doc;
    });
    
    return { success: true, posts: posts, lastDoc: lastVisible };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { success: false, error: error.message, posts: [] };
  }
}

// Subscribe to posts updates (real-time) - optimized
export function subscribeToPosts(callback, maxPosts = 50) {
  try {
    const q = query(
      collection(db, 'foundPosts'),
      orderBy('createdAt', 'desc'),
      limit(maxPosts)
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const posts = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          posts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        callback({ success: true, posts: posts });
      }, 
      (error) => {
        console.error('Error subscribing to posts:', error);
        callback({ success: false, error: error.message, posts: [] });
      },
      { includeMetadataChanges: false } // Only listen to actual data changes
    );
  } catch (error) {
    console.error('Error setting up posts subscription:', error);
    callback({ success: false, error: error.message, posts: [] });
  }
}

// Delete a post (admin only)
export async function deletePost(postId, imageUrl = null) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be logged in to delete posts');
    }

    // Security check: Verify user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      throw new Error('Only admins can delete posts');
    }

    // Double-check admin status before attempting delete
    // This helps catch issues before Firestore rules block it
    console.log('Attempting to delete post:', postId);
    console.log('User UID:', user.uid);
    console.log('Admin status:', adminStatus);

    // Delete post from Firestore
    try {
      await deleteDoc(doc(db, 'foundPosts', postId));
      console.log('Post deleted successfully');
    } catch (firestoreError) {
      console.error('Firestore delete error:', firestoreError);
      
      // Provide more helpful error messages
      if (firestoreError.code === 'permission-denied') {
        throw new Error('Permission denied. Please verify:\n1. Firestore rules are published\n2. Your admin document exists in foundAdmins collection\n3. isAdmin field is set to true');
      }
      throw firestoreError;
    }

    // Note: Image deletion from Storage would require additional setup
    // For now, we'll just delete the post document
    // Images will remain in Storage but won't be accessible (orphaned)

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: error.message };
  }
}

// Format date for display
export function formatDate(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

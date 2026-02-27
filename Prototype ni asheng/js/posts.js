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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;

function compressImage(file) {
  return new Promise((resolve) => {
    if (file.size <= MAX_IMAGE_SIZE && file.type === 'image/gif') {
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

// ========================
// CREATE POST (FIXED)
// ========================
export async function createPost(text, imageFile = null, onProgress = null) {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be logged in');

    const adminStatus = await isAdmin();
    if (!adminStatus) throw new Error('Only admins can create posts');

    if (text && containsProfanity(text)) {
      throw new Error(getProfanityErrorMessage());
    }

    let imageUrl = null;

    if (imageFile) {
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (imageFile.size > 10 * 1024 * 1024) {
        throw new Error('Image must be < 10MB');
      }

      const compressedFile = await compressImage(imageFile);

      const timestamp = Date.now();
      const sanitizedName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(
        storage,
        `found-posts/${user.uid}/${timestamp}_${sanitizedName}`
      );

      let snapshot;

      if (onProgress) {
        snapshot = await new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, compressedFile);

          uploadTask.on(
            'state_changed',
            (snap) => {
              const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => reject(error),
            () => resolve(uploadTask.snapshot)
          );
        });
      } else {
        snapshot = await uploadBytes(storageRef, compressedFile);
      }

      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const postData = {
      text: text.trim() || '',
      imageUrl,
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
    console.error('createPost error:', error);
    return { success: false, error: error.message };
  }
}

// ========================
// FETCH POSTS
// ========================
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
    
    querySnapshot.forEach((docItem) => {
      const data = docItem.data();
      posts.push({
        id: docItem.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      });
      lastVisible = docItem;
    });
    
    return { success: true, posts, lastDoc: lastVisible };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { success: false, error: error.message, posts: [] };
  }
}

// ========================
// REALTIME POSTS
// ========================
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
        querySnapshot.forEach((docItem) => {
          const data = docItem.data();
          posts.push({
            id: docItem.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        callback({ success: true, posts });
      }, 
      (error) => {
        console.error('Error subscribing:', error);
        callback({ success: false, error: error.message, posts: [] });
      }
    );
  } catch (error) {
    callback({ success: false, error: error.message, posts: [] });
  }
}

// ========================
// DELETE POST
// ========================
export async function deletePost(postId) {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not logged in');

    const adminStatus = await isAdmin();
    if (!adminStatus) throw new Error('Admins only');

    await deleteDoc(doc(db, 'foundPosts', postId));

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}

// ========================
// FORMAT DATE
// ========================
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
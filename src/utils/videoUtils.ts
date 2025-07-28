/**
 * @file utils/videoUtils.ts
 * Video utility functions for caching, URL management, and error handling.
 * Based on the video system documentation in VIDEO_SYSTEM.md
 */

import { API_ROOT_URL } from '../constants';

// Cache configuration
const CACHE_NAME = 'fitness-video-cache-v1';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
const CACHE_EXPIRY_DAYS = 30; // 30 days

// IndexedDB setup
let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open('FitnessVideoCache', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains('videos')) {
        const store = database.createObjectStore('videos', { keyPath: 'path' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('size', 'size', { unique: false });
      }
    };
  });
};

// Video URL construction
export const getVideoUrl = (videoPath: string): string => {
  const normalizedPath = videoPath.replace(/^\/+/, '');
  const fullUrl = `${API_ROOT_URL}/${normalizedPath}`;
  
  // Development logging (commented out to avoid TypeScript issues)
  // console.log('Video URL constructed:', { originalPath: videoPath, normalizedPath, apiRoot: API_ROOT_URL, fullUrl });
  
  return fullUrl;
};

// Check if video is cached
export const isVideoCached = async (videoPath: string): Promise<boolean> => {
  try {
    const database = await initDB();
    const transaction = database.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const request = store.get(videoPath);
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(false);
          return;
        }
        
        // Check if cache entry has expired
        const expiryDate = new Date(result.timestamp);
        expiryDate.setDate(expiryDate.getDate() + CACHE_EXPIRY_DAYS);
        
        if (new Date() > expiryDate) {
          // Remove expired entry
          const deleteTransaction = database.transaction(['videos'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('videos');
          deleteStore.delete(videoPath);
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      request.onerror = () => resolve(false);
    });
  } catch (error) {
    console.error('Error checking video cache:', error);
    return false;
  }
};

// Get cached video blob
export const getCachedVideo = async (videoPath: string): Promise<Blob> => {
  const database = await initDB();
  const transaction = database.transaction(['videos'], 'readonly');
  const store = transaction.objectStore('videos');
  const request = store.get(videoPath);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const result = request.result;
      if (result && result.blob) {
        resolve(result.blob);
      } else {
        reject(new Error('Video not found in cache'));
      }
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Cache video blob
export const cacheVideo = async (videoPath: string, blob: Blob): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction(['videos'], 'readwrite');
    const store = transaction.objectStore('videos');
    
    const entry = {
      path: videoPath,
      blob: blob,
      size: blob.size,
      timestamp: new Date().toISOString()
    };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Clean up cache if it's too large
    await cleanupCache();
  } catch (error) {
    console.error('Error caching video:', error);
  }
};

// Clean up cache when it exceeds size limit
const cleanupCache = async (): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const sizeIndex = store.index('size');
    const timestampIndex = store.index('timestamp');
    
    // Get all entries sorted by timestamp (oldest first)
    const request = timestampIndex.getAll();
    
    request.onsuccess = async () => {
      const entries = request.result;
      let totalSize = 0;
      
      // Calculate total size
      for (const entry of entries) {
        totalSize += entry.size || 0;
      }
      
      // If cache is too large, remove oldest entries
      if (totalSize > MAX_CACHE_SIZE) {
        const deleteTransaction = database.transaction(['videos'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('videos');
        
        for (const entry of entries) {
          if (totalSize <= MAX_CACHE_SIZE * 0.8) break; // Stop when we're under 80% of limit
          
          deleteStore.delete(entry.path);
          totalSize -= entry.size || 0;
        }
      }
    };
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
};

// Fetch video with caching
export const fetchVideoWithCache = async (videoPath: string): Promise<Blob> => {
  try {
    // Check cache first
    const cached = await isVideoCached(videoPath);
    if (cached) {
      return await getCachedVideo(videoPath);
    }
    
    // Fetch from network
    const url = getVideoUrl(videoPath);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Cache the video
    await cacheVideo(videoPath, blob);
    
    return blob;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

// Get cached video URL
export const getCachedVideoUrl = async (videoPath: string): Promise<string> => {
  try {
    const blob = await fetchVideoWithCache(videoPath);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error getting cached video URL:', error);
    // Fallback to direct URL
    return getVideoUrl(videoPath);
  }
};

// Get fallback video URL (base64 placeholder)
export const getFallbackVideoUrl = (videoPath: string): string => {
  // Base64 encoded placeholder video
  return 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAGhtZGF0AAACmwYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjkyMSA3YzVmYjQ2IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcWw9MCBkZWJsb2NrY3FsPTAgY3FsbWluZGFjdD0wIGxvY2tpbmd3aWR0aD0yNjUgbG9ja2hlaWdodD0yMCBkaXJlY3Q9MSB3aWR0aD0xOTIgY3JvcF90b3A9MCB0b3A9MCBsZWZ0PTAgY3JvcF9sZWZ0PTAgY3JvcF9yaWdodD0wIHJpZ2h0PTAgY3JvcF9ib3R0b209MCBib3R0b209MCB2dWNfY3FsPTAgbWV4dHJhPTAgY3JvcF9oZWlnaHQ9MCBjaHJvbWFfcXVhbnQ9MCBxdWFudD0wIGZpbGVzaXplPTAgd2VpZ2h0PTE=';
};

// Check if video is accessible
export const isVideoAccessible = async (videoPath: string): Promise<boolean> => {
  try {
    const url = getVideoUrl(videoPath);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Get cache statistics
export const getCacheStats = async () => {
  try {
    const database = await initDB();
    const transaction = database.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const request = store.getAll();
    
    return new Promise<{ totalSize: number; entryCount: number; isSupported: boolean }>((resolve) => {
      request.onsuccess = () => {
        const entries = request.result;
        const totalSize = entries.reduce((sum, entry) => sum + (entry.size || 0), 0);
        
        resolve({
          totalSize,
          entryCount: entries.length,
          isSupported: true
        });
      };
      
      request.onerror = () => {
        resolve({
          totalSize: 0,
          entryCount: 0,
          isSupported: false
        });
      };
    });
  } catch (error) {
    return {
      totalSize: 0,
      entryCount: 0,
      isSupported: false
    };
  }
};

// Clear video cache
export const clearVideoCache = async (): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction(['videos'], 'readwrite');
    const store = transaction.objectStore('videos');
    const request = store.clear();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing video cache:', error);
  }
}; 
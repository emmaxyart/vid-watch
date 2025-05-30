import { VideoFile } from '../types';

// Initialize IndexedDB
const DB_NAME = 'OfflineVideoLibrary';
const DB_VERSION = 1;
const VIDEO_STORE = 'videos';
const THUMBNAIL_STORE = 'thumbnails';

let db: IDBDatabase | null = null;

export const initDatabase = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(true);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event);
      reject('Could not open database');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains(VIDEO_STORE)) {
        database.createObjectStore(VIDEO_STORE, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(THUMBNAIL_STORE)) {
        database.createObjectStore(THUMBNAIL_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveVideo = (video: VideoFile, fileData: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction([VIDEO_STORE, THUMBNAIL_STORE], 'readwrite');
    
    // Save video metadata
    const videoStore = transaction.objectStore(VIDEO_STORE);
    const videoRequest = videoStore.put(video);

    videoRequest.onerror = () => {
      reject('Error saving video metadata');
    };

    // Save video file data
    const thumbnailStore = transaction.objectStore(THUMBNAIL_STORE);
    const thumbnailRequest = thumbnailStore.put({
      id: video.id,
      data: fileData
    });

    thumbnailRequest.onerror = () => {
      reject('Error saving video data');
    };

    transaction.oncomplete = () => {
      resolve(video.id);
    };
  });
};

export const getVideoMetadata = (id: string): Promise<VideoFile> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction(VIDEO_STORE, 'readonly');
    const store = transaction.objectStore(VIDEO_STORE);
    const request = store.get(id);

    request.onerror = () => {
      reject('Error getting video metadata');
    };

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject('Video not found');
      }
    };
  });
};

export const getVideoData = (id: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction(THUMBNAIL_STORE, 'readonly');
    const store = transaction.objectStore(THUMBNAIL_STORE);
    const request = store.get(id);

    request.onerror = () => {
      reject('Error getting video data');
    };

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.data);
      } else {
        reject('Video data not found');
      }
    };
  });
};

export const getAllVideos = (): Promise<VideoFile[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction(VIDEO_STORE, 'readonly');
    const store = transaction.objectStore(VIDEO_STORE);
    const request = store.getAll();

    request.onerror = () => {
      reject('Error getting all videos');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const updateVideoMetadata = (video: VideoFile): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction(VIDEO_STORE, 'readwrite');
    const store = transaction.objectStore(VIDEO_STORE);
    const request = store.put(video);

    request.onerror = () => {
      reject('Error updating video metadata');
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};

export const deleteVideo = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction([VIDEO_STORE, THUMBNAIL_STORE], 'readwrite');
    
    // Delete video metadata
    const videoStore = transaction.objectStore(VIDEO_STORE);
    videoStore.delete(id);

    // Delete video file data
    const thumbnailStore = transaction.objectStore(THUMBNAIL_STORE);
    thumbnailStore.delete(id);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject('Error deleting video');
    };
  });
};

export const getStorageStats = async (): Promise<{ used: number; available: number }> => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimation = await navigator.storage.estimate();
    return {
      used: estimation.usage || 0,
      available: estimation.quota || 0
    };
  }
  return { used: 0, available: 0 };
};
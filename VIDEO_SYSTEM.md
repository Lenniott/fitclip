# Video Playback System Documentation

## Overview

The Fitness Builder application implements a sophisticated video playback system that handles multiple hosting environments, intelligent caching, and robust error handling. This document explains how the system works and how it was implemented.

## Architecture

### Core Components

1. **`utils/videoUtils.ts`** - Main video utility functions
2. **`constants.ts`** - API configuration and host detection
3. **Components** - `ExerciseCard.tsx` and `ExerciseCycleView.tsx` use the video system

## Multi-Host Support

### Host Detection Logic

The system automatically detects which environment it's running in and routes video requests accordingly:

```typescript
// constants.ts - Automatic network detection
const detectNetwork = () => {
  const hostname = window.location.hostname;
  
  // Tailscale network (remote access)
  if (hostname.includes('100.106.26.92') || hostname.includes('100.')) {
    return 'http://100.106.26.92:8000';
  }
  
  // Local network
  if (hostname.includes('192.168.0.47') || hostname.includes('192.168.')) {
    return 'http://192.168.0.47:8000';
  }
  
  // Local development
  return 'http://localhost:8000';
};
```

### Supported Environments

1. **Local Development** (`localhost:5173`)
   - API: `http://localhost:8000`
   - Videos: `http://localhost:8000/storage/clips/...`

2. **Local Network** (`192.168.0.47:5173`)
   - API: `http://192.168.0.47:8000`
   - Videos: `http://192.168.0.47:8000/storage/clips/...`

3. **Tailscale Network** (`100.106.26.92:5173`)
   - API: `http://100.106.26.92:8000`
   - Videos: `http://100.106.26.92:8000/storage/clips/...`

## Video URL Construction

### Path to URL Conversion

The system converts API storage paths to accessible video URLs:

```typescript
// videoUtils.ts
export const getVideoUrl = (videoPath: string): string => {
  const normalizedPath = videoPath.replace(/^\/+/, '');
  const fullUrl = `${API_ROOT_URL}/${normalizedPath}`;
  return fullUrl;
};
```

**Example:**
- API returns: `"storage/clips/exercise-123.mp4"`
- Converts to: `"http://192.168.0.47:8000/storage/clips/exercise-123.mp4"`

## Intelligent Caching System

### IndexedDB Implementation

The system uses IndexedDB for client-side video caching:

```typescript
// Cache configuration
const CACHE_NAME = 'fitness-video-cache-v1';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
const CACHE_EXPIRY_DAYS = 30; // 30 days
```

### Caching Flow

1. **Check Cache First**
   ```typescript
   const cached = await isVideoCached(videoPath);
   if (cached) {
     return getCachedVideo(videoPath);
   }
   ```

2. **Fetch from Network**
   ```typescript
   const url = getVideoUrl(videoPath);
   const response = await fetch(url);
   const blob = await response.blob();
   ```

3. **Cache the Video**
   ```typescript
   await cacheVideo(videoPath, blob);
   ```

4. **Return Object URL**
   ```typescript
   return URL.createObjectURL(blob);
   ```

### Cache Management

- **Automatic Cleanup**: Removes oldest videos when cache exceeds 500MB
- **Expiration**: Videos expire after 30 days
- **Size Tracking**: Monitors total cache size and individual file sizes

## Error Handling & Fallbacks

### Multi-Level Fallback System

1. **Primary**: Cached video URL
2. **Secondary**: Direct network URL
3. **Fallback**: Placeholder video (base64 encoded)

```typescript
export const getCachedVideoUrl = async (videoPath: string): Promise<string> => {
  try {
    // Try cache first
    const blob = await fetchVideoWithCache(videoPath);
    return URL.createObjectURL(blob);
  } catch (error) {
    // Fallback to direct URL
    return getVideoUrl(videoPath);
  }
};

export const getFallbackVideoUrl = (videoPath: string): string => {
  // Base64 encoded placeholder video
  return 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAGhtZGF0AAACmwYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjkyMSA3YzVmYjQ2IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcWw9MCBkZWJsb2NrY3FsPTAgY3FsbWluZGFjdD0wIGxvY2tpbmd3aWR0aD0yNjUgbG9ja2hlaWdodD0yMCBkaXJlY3Q9MSB3aWR0aD0xOTIgY3JvcF90b3A9MCB0b3A9MCBsZWZ0PTAgY3JvcF9sZWZ0PTAgY3JvcF9yaWdodD0wIHJpZ2h0PTAgY3JvcF9ib3R0b209MCBib3R0b209MCB2dWNfY3FsPTAgbWV4dHJhPTAgY3JvcF9oZWlnaHQ9MCBjaHJvbWFfcXVhbnQ9MCBxdWFudD0wIGZpbGVzaXplPTAgd2VpZ2h0PTE=';
};
```

## Component Integration

### ExerciseCard.tsx Usage

```typescript
import { getCachedVideoUrl, getFallbackVideoUrl, isVideoCached } from '../utils/videoUtils';

const ExerciseCard = ({ exercise }) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setIsLoading(true);
        
        // Check if video is cached
        const cached = await isVideoCached(exercise.video_path);
        
        if (cached) {
          // Use cached version
          const url = await getCachedVideoUrl(exercise.video_path);
          setVideoUrl(url);
        } else {
          // Try to load and cache
          const url = await getCachedVideoUrl(exercise.video_path);
          setVideoUrl(url);
        }
      } catch (error) {
        // Fallback to placeholder
        setVideoUrl(getFallbackVideoUrl(exercise.video_path));
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [exercise.video_path]);
};
```

### ExerciseCycleView.tsx Usage

Similar pattern but optimized for full-screen video playback with swipe gestures.

## Performance Optimizations

### 1. Lazy Loading
- Videos are only loaded when components mount
- Cached videos load instantly on subsequent visits

### 2. Progressive Loading
- Network requests only happen when cache misses
- Background caching for future use

### 3. Memory Management
- Automatic cache cleanup prevents memory bloat
- Object URLs are properly managed

### 4. Network Efficiency
- Reduces bandwidth usage through caching
- Handles different network conditions gracefully

## Debugging & Monitoring

### Development Logging

```typescript
if (import.meta.env.DEV) {
  console.log('Video URL constructed:', {
    originalPath: videoPath,
    normalizedPath,
    apiRoot: API_ROOT_URL,
    fullUrl
  });
}
```

### Cache Statistics

```typescript
export const getCacheStats = async () => {
  return {
    totalSize: number,    // Total cache size in bytes
    entryCount: number,   // Number of cached videos
    isSupported: boolean  // IndexedDB support
  };
};
```

## Environment Variables

### Required Environment Variables

```bash
# Local development
VITE_API_BASE_URL_LOCAL=http://localhost:8000

# Network access
VITE_API_BASE_URL_NETWORK=http://192.168.0.47:8000

# Tailscale access
VITE_API_BASE_URL_TAILSCALE=http://100.106.26.92:8000
```

## Troubleshooting

### Common Issues

1. **Videos not loading**
   - Check API server is running
   - Verify video files exist in storage directory
   - Check network connectivity

2. **Cache not working**
   - Verify IndexedDB is supported
   - Check browser storage permissions
   - Clear cache and retry

3. **Wrong host detected**
   - Check environment variables
   - Verify hostname detection logic
   - Manually set API URLs if needed

### Debug Commands

```javascript
// Check cache status
const stats = await getCacheStats();
console.log('Cache stats:', stats);

// Clear cache
await clearVideoCache();

// Check video accessibility
const accessible = await isVideoAccessible('storage/clips/test.mp4');
console.log('Video accessible:', accessible);
```

## Security Considerations

1. **CORS**: Videos are served from the same domain as the API
2. **Authentication**: Video access follows API authentication rules
3. **Storage**: Cached videos are stored locally in IndexedDB
4. **Cleanup**: Automatic cache expiration prevents storage bloat

## Future Enhancements

1. **Adaptive Quality**: Serve different video qualities based on network
2. **Preloading**: Cache videos in background during idle time
3. **Compression**: Implement video compression for better caching
4. **Analytics**: Track video loading performance and cache hit rates

## Summary

The video system provides:

- ✅ **Multi-host support** with automatic detection
- ✅ **Intelligent caching** with IndexedDB
- ✅ **Robust error handling** with fallbacks
- ✅ **Performance optimization** through lazy loading
- ✅ **Memory management** with automatic cleanup
- ✅ **Development tools** for debugging and monitoring

This architecture ensures reliable video playback across different network environments while providing excellent user experience through intelligent caching and error handling. 
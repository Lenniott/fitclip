/**
 * @file constants.ts
 * This file exports constant values used throughout the application,
 * such as API endpoints. This centralizes configuration and makes it
 * easy to update.
 */

// Environment-based API configuration with automatic network detection
const getApiConfig = () => {
    // Check for specific environment variables first
    const localUrl = import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://192.168.0.47:8000';
    const networkUrl = import.meta.env.VITE_API_BASE_URL_NETWORK || 'http://192.168.0.47:8000';
    const tailscaleUrl = import.meta.env.VITE_API_BASE_URL_TAILSCALE || 'http://100.106.26.92:8000';
    
    // Legacy support for single environment variable
    if (import.meta.env.VITE_API_BASE_URL) {
      return {
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        rootUrl: import.meta.env.VITE_API_ROOT_URL || import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
      };
    }
  
    // Automatic network detection
    const detectNetwork = () => {
      // Check if we're on the local network by trying to reach the network IP
      if (typeof window !== 'undefined') {
        // Client-side detection
        const hostname = window.location.hostname;
        
        // If accessing via Tailscale IP, use Tailscale endpoint
        if (hostname.includes('100.106.26.92') || hostname.includes('100.')) {
          return tailscaleUrl;
        }
        
        // If accessing via local network IP, use network endpoint
        if (hostname.includes('192.168.0.47') || hostname.includes('192.168.')) {
          return networkUrl;
        }
        
        // Default to localhost for local development
        return localUrl;
      }
      
      // Server-side or fallback to localhost
      return localUrl;
    };
  
    const detectedUrl = detectNetwork();
    
    return {
      baseUrl: `${detectedUrl}/api/v1`,
      rootUrl: detectedUrl
    };
  };
  
  const apiConfig = getApiConfig();
  
  /**
   * The base URL for the versioned API endpoints (e.g., /api/v1).
   */
  export const API_BASE_URL = apiConfig.baseUrl;
  
  /**
   * The root URL of the API server, used for accessing static assets like videos.
   */
  export const API_ROOT_URL = apiConfig.rootUrl;
  
  // Log the API configuration in development
  if (import.meta.env.DEV) {
    console.log('API Configuration:', { API_BASE_URL, API_ROOT_URL });
    console.log('Available endpoints:', {
      local: import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:8000',
      network: import.meta.env.VITE_API_BASE_URL_NETWORK || 'http://192.168.0.47:8000',
      tailscale: import.meta.env.VITE_API_BASE_URL_TAILSCALE || 'http://100.106.26.92:8000'
    });
    console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
  }
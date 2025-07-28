/**
 * @file services/api.ts
 * API service layer for FitClip backend integration.
 * Provides functions for all endpoints documented in API_ENDPOINTS.MD
 */

import { API_BASE_URL, API_ROOT_URL } from '../constants';
import { Exercise, Routine } from '../types';

// API Response Types
export interface ProcessResponse {
  success: boolean;
  processed_clips: Array<{
    exercise_name: string;
    video_path: string;
    start_time: number;
    end_time: number;
  }>;
  total_clips: number;
  processing_time: number;
  temp_dir: string | null;
  job_id?: string;
}

export interface JobStatusResponse {
  status: 'in_progress' | 'done' | 'failed';
  result: ProcessResponse | { error: string } | null;
}

export interface StoryGenerationResponse {
  stories: string[];
}

export interface SemanticSearchIdsResponse {
  exercise_ids: string[];
  total_found: number;
}

export interface RoutineResponse {
  routine_id: string;
  name: string;
  description: string;
  exercise_ids: string[];
  created_at: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  version?: string;
  services?: {
    database: string;
    qdrant: string;
    ai_services: string;
  };
}

export interface StatsResponse {
  total_exercises: number;
  avg_fitness_level: number;
  avg_intensity: number;
  unique_urls: number;
}

// API Service Class
export class FitClipAPI {
  private baseUrl: string;
  private rootUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.rootUrl = API_ROOT_URL;
  }

  // Helper method for API calls
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Helper method for POST requests
  private async post<T>(endpoint: string, data: any): Promise<T> {
    return this.apiCall<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Helper method for GET requests
  private async get<T>(endpoint: string): Promise<T> {
    return this.apiCall<T>(endpoint, {
      method: 'GET',
    });
  }

  // Helper method for DELETE requests
  private async delete<T>(endpoint: string): Promise<T> {
    return this.apiCall<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // ===== STORY GENERATION =====
  async generateStories(userPrompt: string, storyCount: number = 3): Promise<StoryGenerationResponse> {
    return this.post<StoryGenerationResponse>('/stories/generate', {
      user_prompt: userPrompt,
      story_count: storyCount,
    });
  }

  // ===== SEMANTIC SEARCH =====
  async semanticSearchIds(query: string, limit: number = 5): Promise<SemanticSearchIdsResponse> {
    return this.post<SemanticSearchIdsResponse>('/exercises/semantic-search-ids', {
      query,
      limit,
    });
  }

  // ===== ROUTINE MANAGEMENT =====
  async createRoutine(name: string, description: string, exerciseIds: string[]): Promise<RoutineResponse> {
    return this.post<RoutineResponse>('/routines', {
      name,
      description,
      exercise_ids: exerciseIds,
    });
  }

  async getRoutines(limit: number = 50): Promise<RoutineResponse[]> {
    return this.get<RoutineResponse[]>(`/routines?limit=${limit}`);
  }

  async getRoutine(routineId: string): Promise<RoutineResponse> {
    return this.get<RoutineResponse>(`/routines/${routineId}`);
  }

  async deleteRoutine(routineId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/routines/${routineId}`);
  }

  // ===== VIDEO PROCESSING =====
  async processVideo(url: string, background: boolean = false): Promise<ProcessResponse> {
    return this.post<ProcessResponse>('/process', {
      url,
      background,
    });
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.get<JobStatusResponse>(`/job-status/${jobId}`);
  }

  // ===== EXERCISE MANAGEMENT =====
  async getExercises(url?: string): Promise<Exercise[]> {
    const endpoint = url ? `/exercises?url=${encodeURIComponent(url)}` : '/exercises';
    return this.get<Exercise[]>(endpoint);
  }

  async getExercise(exerciseId: string): Promise<Exercise> {
    return this.get<Exercise>(`/exercises/${exerciseId}`);
  }

  async getExercisesByIds(exerciseIds: string[]): Promise<Exercise[]> {
    return this.post<Exercise[]>('/exercises/bulk', {
      exercise_ids: exerciseIds,
    });
  }

  async deleteExercise(exerciseId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/exercises/${exerciseId}`);
  }

  // ===== HEALTH CHECKS =====
  async getHealth(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/health');
  }

  async getDatabaseHealth(): Promise<{ status: string; database: string; exercises_count: number }> {
    return this.get<{ status: string; database: string; exercises_count: number }>('/health/database');
  }

  async getVectorHealth(): Promise<{ status: string; vector_db: string; collection_info: { vectors_count: number; points_count: number } }> {
    return this.get<{ status: string; vector_db: string; collection_info: { vectors_count: number; points_count: number } }>('/health/vector');
  }

  // ===== STATISTICS =====
  async getStats(): Promise<StatsResponse> {
    return this.get<StatsResponse>('/stats');
  }

  // ===== UTILITY METHODS =====
  
  // Get video URL for an exercise
  getVideoUrl(videoPath: string): string {
    return `${this.rootUrl}/storage/${videoPath}`;
  }

  // Check if a URL is supported for processing
  isSupportedUrl(url: string): boolean {
    const supportedPatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/,
      /^https?:\/\/(www\.)?instagram\.com\/p\//,
      /^https?:\/\/(www\.)?tiktok\.com\/@[^\/]+\/video\//,
    ];
    return supportedPatterns.some(pattern => pattern.test(url));
  }

  // Poll job status until completion
  async pollJobStatus(jobId: string, interval: number = 2000): Promise<ProcessResponse> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getJobStatus(jobId);
          
          if (status.status === 'done' && status.result) {
            resolve(status.result as ProcessResponse);
          } else if (status.status === 'failed') {
            const errorMessage = status.result && 'error' in status.result 
              ? (status.result as { error: string }).error 
              : 'Job failed';
            reject(new Error(errorMessage));
          } else {
            // Continue polling
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
}

// Export singleton instance
export const fitclipAPI = new FitClipAPI();

// Export individual functions for convenience
export const {
  generateStories,
  semanticSearchIds,
  createRoutine,
  getRoutines,
  getRoutine,
  deleteRoutine,
  processVideo,
  getJobStatus,
  getExercises,
  getExercise,
  getExercisesByIds,
  deleteExercise,
  getHealth,
  getDatabaseHealth,
  getVectorHealth,
  getStats,
  getVideoUrl,
  isSupportedUrl,
  pollJobStatus,
} = fitclipAPI; 
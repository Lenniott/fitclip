/**
 * @file hooks/useAPI.ts
 * React hooks for Fitness Builder API integration.
 * Provides easy-to-use hooks with loading states and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { fitclipAPI } from '../services/api';
import { Exercise, Routine } from '../types';

// Generic API hook state
interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic API hook
function useAPI<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): APIState<T> & { refetch: () => void } {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

// Exercise hooks
export function useExercises(url?: string) {
  return useAPI(() => fitclipAPI.getExercises(url), [url]);
}

export function useExercise(exerciseId: string) {
  return useAPI(() => fitclipAPI.getExercise(exerciseId), [exerciseId]);
}

export function useExercisesByIds(exerciseIds: string[]) {
  return useAPI(async () => {
    try {
      // Try the bulk endpoint first
      return await fitclipAPI.getExercisesByIds(exerciseIds);
    } catch (error) {
      console.warn('Bulk exercises endpoint failed, falling back to individual requests:', error);
      
      // Fallback: fetch exercises individually
      const exercises: Exercise[] = [];
      for (const exerciseId of exerciseIds) {
        try {
          const exercise = await fitclipAPI.getExercise(exerciseId);
          exercises.push(exercise);
        } catch (individualError) {
          console.error(`Failed to fetch exercise ${exerciseId}:`, individualError);
          // Continue with other exercises even if one fails
        }
      }
      
      return exercises;
    }
  }, [exerciseIds]);
}

// Routine hooks
export function useRoutines(limit: number = 50) {
  return useAPI(() => fitclipAPI.getRoutines(limit), [limit]);
}

export function useRoutine(routineId: string) {
  return useAPI(() => fitclipAPI.getRoutine(routineId), [routineId]);
}

// Health and stats hooks
export function useHealth() {
  return useAPI(() => fitclipAPI.getHealth(), []);
}

export function useStats() {
  return useAPI(() => fitclipAPI.getStats(), []);
}

// Action hooks (for mutations)
export function useExerciseActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteExercise = useCallback(async (exerciseId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fitclipAPI.deleteExercise(exerciseId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exercise');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteExercise, loading, error };
}

export function useRoutineActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoutine = useCallback(async (name: string, description: string, exerciseIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      return await fitclipAPI.createRoutine(name, description, exerciseIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create routine');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRoutine = useCallback(async (routineId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fitclipAPI.deleteRoutine(routineId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete routine');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createRoutine, deleteRoutine, loading, error };
}

export function useVideoProcessing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const processVideo = useCallback(async (url: string, background: boolean = false) => {
    setLoading(true);
    setError(null);
    setJobId(null);
    try {
      const result = await fitclipAPI.processVideo(url, background);
      if (result.job_id) {
        setJobId(result.job_id);
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { processVideo, loading, error, jobId };
}

export function useStoryGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStories = useCallback(async (userPrompt: string, storyCount: number = 3) => {
    setLoading(true);
    setError(null);
    try {
      return await fitclipAPI.generateStories(userPrompt, storyCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate stories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateStories, loading, error };
}

export function useSemanticSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchIds = useCallback(async (query: string, limit: number = 5) => {
    setLoading(true);
    setError(null);
    try {
      return await fitclipAPI.semanticSearchIds(query, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search exercises');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchIds, loading, error };
}

// Utility hook for job status polling
export function useJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<'in_progress' | 'done' | 'failed' | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const jobStatus = await fitclipAPI.getJobStatus(jobId);
        setStatus(jobStatus.status);
        setResult(jobStatus.result);
        
        if (jobStatus.status === 'in_progress') {
          // Continue polling
          setTimeout(pollStatus, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get job status');
      }
    };

    pollStatus();
  }, [jobId]);

  return { status, result, error };
} 
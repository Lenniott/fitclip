/**
 * @file VideoPlayer.tsx
 * Video player component with swipe gestures for navigation between exercise clips.
 * Integrates with the existing video system from VIDEO_SYSTEM.md
 */

import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from '../types';
import { getCachedVideoUrl, getFallbackVideoUrl, isVideoCached } from '../utils/videoUtils';

interface VideoPlayerProps {
  exercise: Exercise;
  exercises: Exercise[];
  onClose: () => void;
  onViewDetails?: (exercise: Exercise) => void;
}

export function VideoPlayer({ exercise, exercises, onClose, onViewDetails }: VideoPlayerProps) {
  const [currentExercise, setCurrentExercise] = useState<Exercise>(exercise);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const loadVideo = async (exercise: Exercise) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      console.error('Error loading video:', error);
      setError('Failed to load video');
      // Fallback to placeholder
      setVideoUrl(getFallbackVideoUrl(exercise.video_path));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideo(currentExercise);
  }, [currentExercise]);

  // Get current exercise index
  const currentIndex = exercises.findIndex(ex => ex.id === currentExercise.id);
  
  // Navigation functions
  const goToNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentExercise(exercises[currentIndex + 1]);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentExercise(exercises[currentIndex - 1]);
    }
  };

  const goToDetails = () => {
    onViewDetails?.(currentExercise);
  };

  const goBackToList = () => {
    onClose();
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - previous clip
        goToPrevious();
      } else {
        // Swipe right - next clip
        goToNext();
      }
    } else if (isVerticalSwipe && Math.abs(distanceY) > minSwipeDistance) {
      if (distanceY > 0) {
        // Swipe up - view details
        goToDetails();
      } else {
        // Swipe down - back to list
        goBackToList();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'ArrowUp':
          goToDetails();
          break;
        case 'ArrowDown':
        case 'Escape':
          goBackToList();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentExercise]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Video Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Video Element */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-w-full max-h-full object-contain"
            controls
            autoPlay
            muted
            playsInline
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex items-center space-x-3 text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span>Loading video...</span>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center text-white">
              <div className="text-2xl mb-2">⚠️</div>
              <p className="text-lg mb-4">{error}</p>
              <button
                onClick={() => loadVideo(currentExercise)}
                className="px-4 py-2 bg-white text-black rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Navigation Hints */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Swipe Up - View Details */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-75">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>Swipe up for details</span>
            </div>
          </div>

          {/* Swipe Down - Back to List */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-75">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Swipe down to go back</span>
            </div>
          </div>

          {/* Swipe Left - Previous Clip */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-sm opacity-75">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </div>
          </div>

          {/* Swipe Right - Next Clip */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-sm opacity-75">
            <div className="flex items-center space-x-2">
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Exercise Info */}
        <div className="absolute top-4 left-4 text-white">
          <h2 className="text-lg font-semibold">{currentExercise.exercise_name}</h2>
          <p className="text-sm opacity-75">
            {currentIndex + 1} of {exercises.length}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 
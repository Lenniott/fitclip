/**
 * @file App.tsx
 * Main application component demonstrating the list components with real API integration.
 * Shows both exercise and routine lists with live data from the FitClip API.
 */

import React, { useState } from 'react'
import './App.css'
import { ExerciseListPage, RoutineListPage, RoutineDetailPage, VideoPlayer, ExerciseDetailsPage } from './components'
import { useExercises, useRoutines, useExerciseActions, useRoutineActions } from './hooks/useAPI'
import { Exercise, Routine } from './types'
// Import logo as a regular image
const fitclipLogo = '/src/assets/fitclip.svg'

function App() {
  const [currentPage, setCurrentPage] = useState<'exercises' | 'routines' | 'routine-detail'>('exercises');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);

  // API hooks
  const { data: exercises, loading: exercisesLoading, error: exercisesError, refetch: refetchExercises } = useExercises();
  const { data: routines, loading: routinesLoading, error: routinesError, refetch: refetchRoutines } = useRoutines();
  
  // Action hooks
  const { deleteExercise, loading: deleteExerciseLoading } = useExerciseActions();
  const { deleteRoutine, loading: deleteRoutineLoading } = useRoutineActions();

  const handleExerciseSelect = (exercise: Exercise) => {
    console.log('Selected exercise:', exercise);
    setSelectedExercise(exercise);
    setShowVideoPlayer(true);
  };

  const handleExerciseBulkDelete = async (exerciseIds: string[]) => {
    console.log('Bulk delete exercises:', exerciseIds);
    
    // Delete exercises one by one
    for (const exerciseId of exerciseIds) {
      const success = await deleteExercise(exerciseId);
      if (success) {
        console.log(`Deleted exercise: ${exerciseId}`);
      } else {
        console.error(`Failed to delete exercise: ${exerciseId}`);
      }
    }
    
    // Refetch exercises to update the list
    refetchExercises();
  };

  const handleRoutineSelect = (routine: Routine) => {
    console.log('Selected routine:', routine);
    setSelectedRoutine(routine);
    setCurrentPage('routine-detail');
  };

  const handleRoutineBulkDelete = async (routineIds: string[]) => {
    console.log('Bulk delete routines:', routineIds);
    
    // Delete routines one by one
    for (const routineId of routineIds) {
      const success = await deleteRoutine(routineId);
      if (success) {
        console.log(`Deleted routine: ${routineId}`);
      } else {
        console.error(`Failed to delete routine: ${routineId}`);
      }
    }
    
    // Refetch routines to update the list
    refetchRoutines();
  };

  const handleBackToRoutines = () => {
    setSelectedRoutine(null);
    setCurrentPage('routines');
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedExercise(null);
  };

  const handleCloseExerciseDetails = () => {
    setShowExerciseDetails(false);
    setSelectedExercise(null);
  };

  const handleViewExerciseDetails = (exercise: Exercise) => {
    console.log('View exercise details:', exercise);
    setSelectedExercise(exercise);
    setShowVideoPlayer(false);
    setShowExerciseDetails(true);
  };

  // Show loading state if any API calls are in progress
  const isLoading = exercisesLoading || routinesLoading || deleteExerciseLoading || deleteRoutineLoading;

  // Show error state if any API calls failed
  const hasError = exercisesError || routinesError;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src={fitclipLogo} alt="FitClip" className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
                FitClip
              </h1>
            </div>
            {currentPage !== 'routine-detail' && (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setCurrentPage('exercises')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    currentPage === 'exercises'
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Exercises
                </button>
                <button
                  onClick={() => setCurrentPage('routines')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    currentPage === 'routines'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Routines
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Loading Indicator */}
      {isLoading && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 text-blue-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
            <span className="text-xs sm:text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Global Error Display */}
      {hasError && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 text-red-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg max-w-xs sm:max-w-md">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs sm:text-sm">
              <p className="font-medium">API Error</p>
              <p className="text-xs mt-1">{exercisesError || routinesError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {showVideoPlayer && selectedExercise && exercises && (
        <VideoPlayer
          exercise={selectedExercise}
          exercises={currentPage === 'routine-detail' && selectedRoutine ? 
            exercises.filter(ex => selectedRoutine.exercise_ids.includes(ex.id)) : 
            exercises
          }
          onClose={handleCloseVideoPlayer}
          onViewDetails={handleViewExerciseDetails}
        />
      )}

      {/* Exercise Details Page */}
      {showExerciseDetails && selectedExercise && (
        <ExerciseDetailsPage
          exercise={selectedExercise}
          onClose={handleCloseExerciseDetails}
          onRemove={(exercise) => {
            console.log('Remove exercise:', exercise);
            // Implement exercise removal logic
          }}
        />
      )}

      {/* Page Content */}
      {currentPage === 'exercises' ? (
        <ExerciseListPage
          exercises={exercises || []}
          onExerciseSelect={handleExerciseSelect}
          onBulkDelete={handleExerciseBulkDelete}
          loading={exercisesLoading}
        />
      ) : currentPage === 'routines' ? (
        <RoutineListPage
          routines={routines || []}
          exercises={exercises || []}
          onRoutineSelect={handleRoutineSelect}
          onBulkDelete={handleRoutineBulkDelete}
          loading={routinesLoading}
        />
      ) : currentPage === 'routine-detail' && selectedRoutine ? (
        <RoutineDetailPage
          routine={selectedRoutine}
          onBack={handleBackToRoutines}
          onExerciseSelect={handleExerciseSelect}
        />
      ) : null}
    </div>
  )
}

export default App

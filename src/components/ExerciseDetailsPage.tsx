/**
 * @file ExerciseDetailsPage.tsx
 * Full-screen exercise details page with stats, details, and action buttons.
 * Matches the wireframe design with exercise name in header and action buttons at bottom.
 */

import React from 'react';
import { Exercise } from '../types';

interface ExerciseDetailsPageProps {
  exercise: Exercise;
  onClose: () => void;
  onAddToRoutine?: (exercise: Exercise) => void;
  onRemoveFromRoutine?: (exercise: Exercise) => void;
  onRemove?: (exercise: Exercise) => void;
  isInRoutine?: boolean;
}

export function ExerciseDetailsPage({
  exercise,
  onClose,
  onAddToRoutine,
  onRemoveFromRoutine,
  onRemove,
  isInRoutine = false
}: ExerciseDetailsPageProps) {
  const handleAddRemoveFromRoutine = () => {
    if (isInRoutine) {
      onRemoveFromRoutine?.(exercise);
    } else {
      onAddToRoutine?.(exercise);
    }
  };

  const handleRemove = () => {
    onRemove?.(exercise);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
          {exercise.exercise_name}
        </h1>
        <button
          onClick={onClose}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
            Exercise Stats & Details
          </h2>
          
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-sm text-slate-600 mb-1">Fitness Level</div>
                <div className="text-lg font-semibold text-slate-900">Level {exercise.fitness_level}</div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-sm text-slate-600 mb-1">Intensity</div>
                <div className="text-lg font-semibold text-slate-900">{exercise.intensity}/10</div>
              </div>
            </div>

            {/* Exercise Details */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-sm text-slate-600 mb-1">Rounds & Reps</div>
              <div className="text-base text-slate-900">{exercise.rounds_reps}</div>
            </div>

            {/* Video Path */}
            {exercise.video_path && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-sm text-slate-600 mb-1">Video</div>
                <div className="text-sm text-slate-900 font-mono break-all">
                  {exercise.video_path}
                </div>
              </div>
            )}

            {/* Exercise ID */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-sm text-slate-600 mb-1">Exercise ID</div>
              <div className="text-sm text-slate-900 font-mono">{exercise.id}</div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-sm font-medium text-teal-800">Active Exercise</span>
                </div>
                <div className="text-xs text-teal-600 mt-1">Ready for workout</div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-medium text-indigo-800">Video Available</span>
                </div>
                <div className="text-xs text-indigo-600 mt-1">Demo video ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <button
          onClick={handleAddRemoveFromRoutine}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isInRoutine
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          {isInRoutine ? 'Remove from routine' : 'Add to routine'}
        </button>
        
        <button
          onClick={handleRemove}
          className="w-full py-3 px-4 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
} 
/**
 * @file RoutineDetailPage.tsx
 * Displays exercises for a specific routine using the bulk endpoint.
 * Shows the same list interface as the main exercise list but filtered to routine exercises.
 * Mobile-first responsive design with proper spacing and sizing.
 */

import React, { useState } from 'react';
import { List } from './List';
import { ExerciseListItem } from './index';
import { Exercise, Routine } from '../types';
import { useExercisesByIds, useExerciseActions } from '../hooks/useAPI';

interface RoutineDetailPageProps {
  routine: Routine;
  onBack: () => void;
  onBulkDelete?: (exerciseIds: string[]) => void;
  onExerciseSelect?: (exercise: Exercise) => void;
}

export function RoutineDetailPage({ routine, onBack, onBulkDelete, onExerciseSelect }: RoutineDetailPageProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Fetch exercises for this routine using the bulk endpoint
  const { data: exercises, loading, error, refetch } = useExercisesByIds(routine.exercise_ids);
  const { deleteExercise, loading: deleteLoading } = useExerciseActions();

  const handleItemSelect = (exercise: Exercise) => {
    console.log('Selected exercise:', exercise);
    onExerciseSelect?.(exercise);
  };

  const handleCheckChange = (exerciseId: string, checked: boolean) => {
    const newChecked = new Set(checkedItems);
    if (checked) {
      newChecked.add(exerciseId);
    } else {
      newChecked.delete(exerciseId);
    }
    setCheckedItems(newChecked);
  };

  const handleBulkDelete = async () => {
    if (checkedItems.size > 0) {
      // Delete exercises one by one
      for (const exerciseId of checkedItems) {
        const success = await deleteExercise(exerciseId);
        if (success) {
          console.log(`Deleted exercise: ${exerciseId}`);
        } else {
          console.error(`Failed to delete exercise: ${exerciseId}`);
        }
      }
      
      // Refetch exercises to update the list
      refetch();
      setCheckedItems(new Set());
      setSelectionMode(false);
    }
  };

  const isItemChecked = (exerciseId: string): boolean => {
    return checkedItems.has(exerciseId);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
              <p className="font-medium text-sm sm:text-base">⚠️ Loading routine exercises</p>
              <p className="text-xs sm:text-sm mt-1">
                The bulk endpoint is temporarily unavailable. Loading exercises individually...
              </p>
              <button
                onClick={refetch}
                className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Routines</span>
            </button>
          </div>
          
          <h1 className="text-lg sm:text-xl lg:text-2xl font-regular text-slate-900 text-start">
            {routine.name}
          </h1>
          <p className="text-slate-600 text-start mb-4 text-sm sm:text-base">
            {routine.description}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-regular text-slate-900">
              Routine Exercises ({exercises?.length || 0})
            </h2>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {selectionMode && checkedItems.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Delete ({checkedItems.size})
                </button>
              )}
              <button
                onClick={() => setSelectionMode(!selectionMode)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  selectionMode
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {selectionMode ? 'Exit Selection' : 'Select Mode'}
              </button>
            </div>
          </div>

          <List
            items={exercises || []}
            renderItem={(exercise, index) => {
              const checked = isItemChecked(exercise.id);

              return (
                <ExerciseListItem
                  exercise={exercise}
                  onSelect={handleItemSelect}
                  selectionMode={selectionMode}
                  isChecked={checked}
                  onCheckChange={handleCheckChange}
                  selected={false}
                />
              );
            }}
            emptyMessage="No exercises found in this routine"
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
} 
/**
 * @file ExerciseListItem.tsx
 * Displays a single exercise item with video preview and interactive features.
 * Mobile-first responsive design with proper spacing and sizing.
 */

import React from 'react';
import { ExerciseListItemProps } from '../types';
import { API_ROOT_URL } from '../constants';

export function ExerciseListItem({
  exercise,
  onSelect,
  onCheckChange, // New prop
  selected = false,
  showVideo = true,
  selectionMode = false, // New prop
  isChecked = false // New prop
}: ExerciseListItemProps) {
  const videoUrl = `${API_ROOT_URL}/storage/${exercise.video_path}`;

  const handleSelect = () => {
    if (selectionMode) {
      onCheckChange?.(exercise.id, !isChecked);
    } else {
      onSelect?.(exercise);
    }
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onCheckChange?.(exercise.id, e.target.checked);
  };

  const shouldHighlight = selectionMode ? isChecked : selected; // New logic

  return (
    <div
      className={`
        bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
        ${shouldHighlight ? 'ring-2 ring-teal-500 border-teal-200' : 'border-slate-200'}
      `}
      onClick={handleSelect}
    >
      <div className="p-3 sm:p-4 flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-center space-x-2 sm:space-x-3"> {/* Changed to items-center */}
            {selectionMode && ( // Conditional checkbox
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckChange}
                className="w-4 h-4 text-teal-600 bg-white border-slate-300 rounded focus:ring-teal-500 focus:ring-2 flex-shrink-0"
              />
            )}
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 flex flex-col items-start min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1 line-clamp-2">
                {exercise.exercise_name}
              </h3>
              <div className="flex flex-row items-center sm:items-start gap-2 sm:space-x-4 text-xs sm:text-sm text-slate-600">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-1 sm:mr-2"></span>
                  Level {exercise.fitness_level}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-1 sm:mr-2"></span>
                  Intensity {exercise.intensity}/10
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
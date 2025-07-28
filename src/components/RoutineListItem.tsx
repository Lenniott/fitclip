/**
 * @file RoutineListItem.tsx
 * Displays a single routine item with exercise count and interactive features.
 * Mobile-first responsive design with proper spacing and sizing.
 */

import React from 'react';
import { RoutineListItemProps } from '../types';

export function RoutineListItem({
  routine,
  exercises = [],
  onSelect,
  onCheckChange, // New prop
  selected = false,
  selectionMode = false, // New prop
  isChecked = false // New prop
}: RoutineListItemProps) {
  const handleSelect = () => {
    if (selectionMode) {
      onCheckChange?.(routine.routine_id, !isChecked);
    } else {
      onSelect?.(routine);
    }
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onCheckChange?.(routine.routine_id, e.target.checked);
  };

  const shouldHighlight = selectionMode ? isChecked : selected; // New logic

  return (
    <div
      className={`
        bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
        ${shouldHighlight ? 'ring-2 ring-indigo-500 border-indigo-200' : 'border-slate-200'}
      `}
      onClick={handleSelect}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-center space-x-2 sm:space-x-3"> {/* Changed to items-center */}
            {selectionMode && ( // Conditional checkbox
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckChange}
                className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 flex-shrink-0"
              />
            )}
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex-1 flex flex-col items-start min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
                {routine.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-slate-600">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-1 sm:mr-2"></span>
                  {routine.exercise_ids.length} exercises
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
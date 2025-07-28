/**
 * @file List.tsx
 * Generic list component for rendering any type of items with loading and empty states.
 * Mobile-first responsive design with proper spacing and sizing.
 */

import React from 'react';
import { ListProps } from '../types';

export function List<T>({
  items,
  renderItem,
  className = '',
  emptyMessage = 'No items found',
  loading = false
}: ListProps<T>) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-6 sm:p-8 ${className}`}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-indigo-600"></div>
          <span className="text-sm sm:text-base text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center p-6 sm:p-8 ${className}`}>
        <div className="text-center">
          <div className="text-slate-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📋</div>
          <p className="text-slate-500 text-base sm:text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 sm:space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="animate-fade-in">
          {renderItem(item, index, { selectionMode: false })} {/* selectionMode prop added */}
        </div>
      ))}
    </div>
  );
} 
/**
 * @file ListPage.tsx
 * Generic list page component for displaying lists with selection mode and bulk actions.
 * Mobile-first responsive design with proper spacing and sizing.
 */

import React, { useState } from 'react';
import { List } from './List';
import { ExerciseListItem, RoutineListItem, SearchComponent } from './index'; // Import specific list items
import { Exercise, Routine } from '../types';

interface ListPageProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number, props: any) => React.ReactNode; // Updated signature
  onItemSelect?: (item: T) => void;
  onBulkDelete?: (itemIds: string[]) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  onBasicSearch?: (query: string) => void;
  onSemanticSearch?: (query: string) => void;
}

export function ListPage<T extends { id?: string; routine_id?: string }>({
  title,
  items,
  renderItem,
  onItemSelect,
  onBulkDelete,
  emptyMessage = 'No items found',
  loading = false,
  className = '',
  onBasicSearch,
  onSemanticSearch
}: ListPageProps<T>) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleItemSelect = (item: T) => {
    onItemSelect?.(item);
  };

  const handleCheckChange = (itemId: string, checked: boolean) => {
    const newChecked = new Set(checkedItems);
    if (checked) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    setCheckedItems(newChecked);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && checkedItems.size > 0) {
      onBulkDelete(Array.from(checkedItems));
      setCheckedItems(new Set());
      setSelectionMode(false);
    }
  };

  const getItemId = (item: T): string => {
    return (item as any).routine_id || (item as any).id || '';
  };

  const isItemChecked = (item: T): boolean => {
    return checkedItems.has(getItemId(item));
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${className}`}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row items-center justify-between mb-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-regular text-slate-900 text-start">
              {title}
            </h1>
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

          {/* Search Component for Exercise Library */}
          
          {title === "Exercise Library" && onBasicSearch && onSemanticSearch && (
            <SearchComponent
              onBasicSearch={onBasicSearch}
              onSemanticSearch={onSemanticSearch}
              loading={loading}
            />
          )}

          <List
            items={items}
            renderItem={(item, index) => {
              const itemId = getItemId(item);
              const checked = isItemChecked(item);

              // Pass selection mode props to the rendered item
              return renderItem(item, index, {
                onSelect: handleItemSelect,
                selectionMode,
                isChecked: checked,
                onCheckChange: handleCheckChange,
                selected: false
              });
            }}
            emptyMessage={emptyMessage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export function ExerciseListPage({
  exercises,
  onExerciseSelect,
  onBulkDelete,
  loading = false,
  onBasicSearch,
  onSemanticSearch
}: {
  exercises: Exercise[];
  onExerciseSelect?: (exercise: Exercise) => void;
  onBulkDelete?: (exerciseIds: string[]) => void;
  loading?: boolean;
  onBasicSearch?: (query: string) => void;
  onSemanticSearch?: (query: string) => void;
}) {
  return (
    <ListPage
      title="Exercise Library"
      items={exercises}
      renderItem={(exercise, index, props) => ( // Updated signature
        <ExerciseListItem
          exercise={exercise}
          onSelect={props.onSelect}
          selectionMode={props.selectionMode}
          isChecked={props.isChecked}
          onCheckChange={props.onCheckChange}
          selected={props.selected}
        />
      )}
      onItemSelect={onExerciseSelect}
      onBulkDelete={onBulkDelete}
      emptyMessage="No exercises found"
      loading={loading}
      onBasicSearch={onBasicSearch}
      onSemanticSearch={onSemanticSearch}
    />
  );
}

export function RoutineListPage({
  routines,
  exercises = [],
  onRoutineSelect,
  onBulkDelete,
  loading = false
}: {
  routines: Routine[];
  exercises?: Exercise[];
  onRoutineSelect?: (routine: Routine) => void;
  onBulkDelete?: (routineIds: string[]) => void;
  loading?: boolean;
}) {
  return (
    <ListPage
      title="Routine Library"
      items={routines}
      renderItem={(routine, index, props) => ( // Updated signature
        <RoutineListItem
          routine={routine}
          exercises={exercises.filter(ex => routine.exercise_ids.includes(ex.id))}
          onSelect={props.onSelect}
          selectionMode={props.selectionMode}
          isChecked={props.isChecked}
          onCheckChange={props.onCheckChange}
          selected={props.selected}
        />
      )}
      onItemSelect={onRoutineSelect}
      onBulkDelete={onBulkDelete}
      emptyMessage="No routines found"
      loading={loading}
    />
  );
} 
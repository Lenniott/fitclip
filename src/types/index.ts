/**
 * @file types/index.ts
 * TypeScript interfaces for the application data types.
 * Based on the API documentation for exercises and routines.
 */

export interface Exercise {
  id: string;
  exercise_name: string;
  video_path: string;
  start_time: number;
  end_time: number;
  how_to: string;
  benefits: string;
  counteracts: string;
  fitness_level: number;
  rounds_reps: string;
  intensity: number;
  qdrant_id: string;
  created_at: string;
}

export interface Routine {
  routine_id: string;
  name: string;
  description: string;
  exercise_ids: string[];
  created_at: string;
}

export interface ExerciseListItemProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
  selected?: boolean;
  showVideo?: boolean;
  selectionMode?: boolean; // New: controls visibility of selection checkbox
  isChecked?: boolean; // New: whether this item is checked for bulk actions
  onCheckChange?: (exerciseId: string, checked: boolean) => void; // New: checkbox change handler
}

export interface RoutineListItemProps {
  routine: Routine;
  exercises?: Exercise[]; // Optional: populated exercises for display
  onSelect?: (routine: Routine) => void;
  onDelete?: (routineId: string) => void;
  selected?: boolean;
  selectionMode?: boolean; // New: controls visibility of selection checkbox
  isChecked?: boolean; // New: whether this item is checked for bulk actions
  onCheckChange?: (routineId: string, checked: boolean) => void; // New: checkbox change handler
}

export interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, props: any) => React.ReactNode; // Updated to pass props
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  selectionMode?: boolean; // New: passes selection mode to render function
}

export type ListItemType = Exercise | Routine; 
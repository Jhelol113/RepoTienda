export type Priority = 'Alta' | 'Media' | 'Baja';

export interface Task {
  id: string;
  title: string;
  project: string; // e.g. "Desarrollo", "Diseño", "Reunión", "Aprendizaje", "Administración"
  priority: Priority;
  completed: boolean;
  createdAt: string;
  timeSpent: number; // in seconds
}

export interface TimeLog {
  id: string;
  taskId: string;
  taskTitle: string;
  project: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  duration: number;  // in seconds
  notes?: string;
}

export interface ProjectCategory {
  name: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export const CATEGORIES: Record<string, ProjectCategory> = {
  'Desarrollo': {
    name: 'Desarrollo',
    color: '#3b82f6', // blue
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    borderClass: 'border-blue-200 dark:border-blue-800/60',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  'Diseño': {
    name: 'Diseño',
    color: '#ec4899', // pink
    bgClass: 'bg-pink-50 dark:bg-pink-950/40',
    borderClass: 'border-pink-200 dark:border-pink-800/60',
    textClass: 'text-pink-700 dark:text-pink-300',
  },
  'Reunión': {
    name: 'Reunión',
    color: '#8b5cf6', // purple
    bgClass: 'bg-purple-50 dark:bg-purple-950/40',
    borderClass: 'border-purple-200 dark:border-purple-800/60',
    textClass: 'text-purple-700 dark:text-purple-300',
  },
  'Aprendizaje': {
    name: 'Aprendizaje',
    color: '#10b981', // emerald
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  'Administración': {
    name: 'Administración',
    color: '#f59e0b', // amber
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
};

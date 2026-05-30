import { Task, TimeLog } from './types';

// Anchor point is Saturday, May 30, 2026
export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Refactorizar API de usuarios',
    project: 'Desarrollo',
    priority: 'Alta',
    completed: true,
    createdAt: '2026-05-27T08:00:00.000Z',
    timeSpent: 7200, // 2 hours
  },
  {
    id: 'task-2',
    title: 'Diseñar Mockups del Dashboard',
    project: 'Diseño',
    priority: 'Alta',
    completed: true,
    createdAt: '2026-05-25T09:00:00.000Z',
    timeSpent: 10800, // 3 hours
  },
  {
    id: 'task-3',
    title: 'Reunión de Sincronización Diaria',
    project: 'Reunión',
    priority: 'Media',
    completed: true,
    createdAt: '2026-05-27T09:00:00.000Z',
    timeSpent: 1800, // 30 mins
  },
  {
    id: 'task-4',
    title: 'Curso de React Avanzado & TS',
    project: 'Aprendizaje',
    priority: 'Baja',
    completed: false,
    createdAt: '2026-05-26T14:00:00.000Z',
    timeSpent: 5400, // 1.5 hours
  },
  {
    id: 'task-5',
    title: 'Organizar Archivos Financieros',
    project: 'Administración',
    priority: 'Media',
    completed: true,
    createdAt: '2026-05-29T15:30:00.000Z',
    timeSpent: 3600, // 1 hour
  },
  {
    id: 'task-6',
    title: 'Crear pruebas unitarias de componentes',
    project: 'Desarrollo',
    priority: 'Media',
    completed: false,
    createdAt: '2026-05-29T09:00:00.000Z',
    timeSpent: 3600, // 1 hour
  },
  {
    id: 'task-7',
    title: 'Planificar documentación del sprint',
    project: 'Administración',
    priority: 'Baja',
    completed: false,
    createdAt: '2026-05-30T09:12:00.000Z',
    timeSpent: 0,
  }
];

export const INITIAL_LOGS: TimeLog[] = [
  {
    id: 'log-1',
    taskId: 'task-2',
    taskTitle: 'Diseñar Mockups del Dashboard',
    project: 'Diseño',
    startTime: '2026-05-25T09:00:00.000Z',
    endTime: '2026-05-25T11:00:00.000Z',
    duration: 7200,
    notes: 'Primer boceto de la distribución bento de widgets estadísticas.',
  },
  {
    id: 'log-2',
    taskId: 'task-4',
    taskTitle: 'Curso de React Avanzado & TS',
    project: 'Aprendizaje',
    startTime: '2026-05-26T15:00:00.000Z',
    endTime: '2026-05-26T16:30:00.000Z',
    duration: 5400,
    notes: 'Estudiando Hooks avanzados, useCallback y custom hooks.',
  },
  {
    id: 'log-3',
    taskId: 'task-2',
    taskTitle: 'Diseñar Mockups del Dashboard',
    project: 'Diseño',
    startTime: '2026-05-26T11:30:00.000Z',
    endTime: '2026-05-26T12:30:00.000Z',
    duration: 3600,
    notes: 'Ajustando contrastes, paleta de colores y bordes curvos.',
  },
  {
    id: 'log-4',
    taskId: 'task-1',
    taskTitle: 'Refactorizar API de usuarios',
    project: 'Desarrollo',
    startTime: '2026-05-27T14:45:00.000Z',
    endTime: '2026-05-27T16:15:00.000Z',
    duration: 5400,
    notes: 'Migración de controladores antiguos a Express routers limpios.',
  },
  {
    id: 'log-5',
    taskId: 'task-3',
    taskTitle: 'Reunión de Sincronización Diaria',
    project: 'Reunión',
    startTime: '2026-05-28T09:30:00.000Z',
    endTime: '2026-05-28T10:00:00.000Z',
    duration: 1800,
    notes: 'Presentación de avances semanales del equipo.',
  },
  {
    id: 'log-6',
    taskId: 'task-1',
    taskTitle: 'Refactorizar API de usuarios',
    project: 'Desarrollo',
    startTime: '2026-05-28T11:00:00.000Z',
    endTime: '2026-05-28T11:30:00.000Z',
    duration: 1800,
    notes: 'Validación de tokens CORS y pruebas de autenticación.',
  },
  {
    id: 'log-7',
    taskId: 'task-5',
    taskTitle: 'Organizar Archivos Financieros',
    project: 'Administración',
    startTime: '2026-05-29T16:00:00.000Z',
    endTime: '2026-05-29T17:00:00.000Z',
    duration: 3600,
    notes: 'Clasificación de facturas del mes de mayo.',
  },
  {
    id: 'log-8',
    taskId: 'task-6',
    taskTitle: 'Crear pruebas unitarias de componentes',
    project: 'Desarrollo',
    startTime: '2026-05-30T08:30:00.000Z',
    endTime: '2026-05-30T09:30:00.000Z',
    duration: 3600,
    notes: 'Prueba de cobertura para componentes de temporizador.',
  }
];

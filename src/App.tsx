import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Trash2, 
  RotateCcw, 
  Moon, 
  Sun, 
  Coffee, 
  TrendingUp, 
  Layers, 
  HelpCircle,
  FolderSync
} from 'lucide-react';
import { Task, TimeLog, Priority } from './types';
import { INITIAL_TASKS, INITIAL_LOGS } from './data';

// Components
import { MetricCards } from './components/MetricCards';
import { TimerWidget } from './components/TimerWidget';
import { TaskTrackerList } from './components/TaskTrackerList';
import { ProductivityCharts } from './components/ProductivityCharts';
import { LogHistoryList } from './components/LogHistoryList';

export default function App() {
  // Theme state representation
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('productivity_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // High-tech dark mode by default!
  });

  // Main task state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('productivity_tasks_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TASKS;
  });

  // Main time log state
  const [logs, setLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('productivity_logs_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_LOGS;
  });

  // State to sync the active task playing
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('productivity_tasks_v1', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('productivity_logs_v1', JSON.stringify(logs));
  }, [logs]);

  // Synchronize layout element background class for theme
  useEffect(() => {
    localStorage.setItem('productivity_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#18181b'; // zinc-900 background to avoid white flashes
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f4f4f5'; // zinc-100 background
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State utility to reset database to initial seed data
  const handleResetToDemo = () => {
    if (window.confirm('¿Quieres restaurar la base de datos de prueba? Esto sobrescribirá tus registros actuales.')) {
      setTasks(INITIAL_TASKS);
      setLogs(INITIAL_LOGS);
      setActiveTaskId(null);
    }
  };

  // State utility to completely clear all data
  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de querer vaciar toda la información? Comenzarás completamente de cero.')) {
      setTasks([]);
      setLogs([]);
      setActiveTaskId(null);
    }
  };

  // Callback to add a task
  const handleAddTask = (title: string, project: string, priority: Priority) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      project,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      timeSpent: 0
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Callback to toggle task complete/pending status
  const handleToggleTaskCompletion = (taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
    // If the completed task was currently active on chronometer, deactivate it
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  // Callback to delete a task
  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('¿Quieres eliminar esta tarea? Esto no borrará sus registros de tiempo pasados.')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (activeTaskId === taskId) {
        setActiveTaskId(null);
      }
    }
  };

  // Handle play trigger from task list
  const handleStartTrackingFromList = (taskId: string) => {
    setActiveTaskId(taskId);
  };

  // Add a new Time Log (Updates accumulator on connected task!)
  const handleAddLog = (newLogData: Omit<TimeLog, 'id'>) => {
    const newId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newLog: TimeLog = {
      ...newLogData,
      id: newId
    };

    setLogs(prev => [newLog, ...prev]);

    // If the log is linked to a task, increment that task's total spent time
    if (newLog.taskId && newLog.taskId !== 'general') {
      setTasks(prev =>
        prev.map(task => {
          if (task.id === newLog.taskId) {
            return {
              ...task,
              timeSpent: task.timeSpent + newLog.duration
            };
          }
          return task;
        })
      );
    }

    // Clean up active task ID trigger so it can be re-triggered cleanly
    setActiveTaskId(null);
  };

  // Delete a Time Log (and deduct its duration from the task's accumulator!)
  const handleDeleteLog = (logId: string) => {
    if (window.confirm('¿Deseas eliminar este registro de tiempo? El tiempo acumulado en la tarea asociada se actualizará.')) {
      const logToDelete = logs.find(l => l.id === logId);
      if (logToDelete) {
        // Remove log from list
        setLogs(prev => prev.filter(l => l.id !== logId));

        // Deduct duration from the task
        if (logToDelete.taskId && logToDelete.taskId !== 'general') {
          setTasks(prev =>
            prev.map(task => {
              if (task.id === logToDelete.taskId) {
                const updatedTime = Math.max(0, task.timeSpent - logToDelete.duration);
                return {
                  ...task,
                  timeSpent: updatedTime
                };
              }
              return task;
            })
          );
        }
      }
    }
  };

  // Update notes of a log
  const handleUpdateLogNotes = (logId: string, notes: string) => {
    setLogs(prev =>
      prev.map(log => {
        if (log.id === logId) {
          return { ...log, notes };
        }
        return log;
      })
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation / Header Banner */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm shadow-blue-500/20">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
                Gestor de Tareas y Tiempos
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-400/20 animate-pulse">
                  v1.5
                </span>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Alcanza el máximo rendimiento midiendo, organizando y visualizando tu nivel de productividad.
              </p>
            </div>
          </div>

          {/* Theme & DB Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Helper Tips */}
            <div className="hidden md:flex items-center gap-1 text-[11px] text-zinc-400 mr-2 bg-zinc-50 dark:bg-zinc-950/20 px-2.5 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
              <Coffee className="w-3.5 h-3.5 text-amber-500" />
              <span>Dato: Pulsa play en el listado para conectar el cronómetro.</span>
            </div>

            {/* Toggle Theme button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-50 dark:bg-zinc-950/40 hover:dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Sync / Seed Default Data button */}
            <button
              onClick={handleResetToDemo}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-700 hover:text-white dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 hover:bg-purple-600 dark:hover:bg-purple-900 bg-white dark:bg-zinc-900 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Cargar registros iniciales de demostración"
            >
              <FolderSync className="w-4 h-4" />
              <span>Demo</span>
            </button>

            {/* Clean Database button */}
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:text-white dark:text-red-400 border border-red-150 dark:border-red-950 hover:bg-red-600 dark:hover:bg-red-900 bg-white dark:bg-zinc-900 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Borrar todos los registros actuales"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vaciar</span>
            </button>
          </div>
        </header>

        {/* 1. KPIs HUD Metrics */}
        <section className="w-full">
          <MetricCards tasks={tasks} logs={logs} />
        </section>

        {/* 2. Main Workspace Grid - Bento style */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel cols (5 units wide out of 12) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Stopwatch entry wrapper */}
            <section aria-label="Stopwatch Timer">
              <TimerWidget 
                tasks={tasks}
                activeTaskId={activeTaskId}
                onStartTracking={handleStartTrackingFromList}
                onAddLog={handleAddLog}
                onAddTask={handleAddTask}
              />
            </section>

            {/* Editable Task registration */}
            <section aria-label="Interactive Task List">
              <TaskTrackerList 
                tasks={tasks}
                activeTaskId={activeTaskId}
                onStartTracking={handleStartTrackingFromList}
                onAddTask={handleAddTask}
                onToggleTaskCompletion={handleToggleTaskCompletion}
                onDeleteTask={handleDeleteTask}
              />
            </section>

          </div>

          {/* Right panel analytics (7 units wide) */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full justify-start">
            
            {/* Dynamic Diagrams */}
            <section aria-label="Productivity Analytics Charts" className="flex-1">
              <ProductivityCharts tasks={tasks} logs={logs} />
            </section>

            {/* Historical list */}
            <section aria-label="Chronological logged sessions">
              <LogHistoryList 
                logs={logs}
                onDeleteLog={handleDeleteLog}
                onUpdateLogNotes={handleUpdateLogNotes}
              />
            </section>

          </div>
        </main>

        <footer className="pt-6 text-center border-t border-zinc-200/50 dark:border-zinc-800/40 text-[10px] font-medium text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Gestor de Tareas y Tiempos — Generador de Analítica de Rendimiento.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> 
              Local Database Safe (Local Storage)
            </span>
            <span className="font-mono text-zinc-500">UTC: 2026-05-30 01:02:12</span>
          </div>
        </footer>
        
      </div>
    </div>
  );
}

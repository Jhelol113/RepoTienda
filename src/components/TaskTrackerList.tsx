import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Trash2, CheckCircle, Circle, Search, SlidersHorizontal, Plus, ChevronDown, ListTodo } from 'lucide-react';
import { Task, CATEGORIES, Priority } from '../types';

interface TaskTrackerListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onStartTracking: (taskId: string) => void;
  onAddTask: (title: string, project: string, priority: Priority) => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskTrackerList({
  tasks,
  activeTaskId,
  onStartTracking,
  onAddTask,
  onToggleTaskCompletion,
  onDeleteTask,
}: TaskTrackerListProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Task Creation Form states
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('Desarrollo');
  const [newPriority, setNewPriority] = useState<Priority>('Media');
  const [showForm, setShowForm] = useState(false);

  // Helper to format accrued seconds
  const formatAccruedTime = (seconds: number) => {
    if (seconds <= 0) return 'Sin trackear';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  // Handler for form submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newProject, newPriority);
    setNewTitle('');
    setShowForm(false);
  };

  // Filter Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !task.completed) ||
      (statusFilter === 'completed' && task.completed);
    const matchesCategory = categoryFilter === 'all' || task.project === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Count active vs completed
  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden h-full">
      {/* Header & Toggle Add Task */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg">
            <ListTodo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white">
            Registro de Tareas
          </h2>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
        >
          <Plus className={`w-3.5 h-3.5 transition-transform ${showForm ? 'rotate-45' : ''}`} />
          Nueva Tarea
        </button>
      </div>

      {/* Task Insertion Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-950/10 p-5 space-y-4 overflow-hidden"
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Título de la Tarea
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. Integrar pasarela de pago Stripe, redactar minutas..."
                className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Proyecto / Categoría
                </label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all"
                >
                  {Object.keys(CATEGORIES).map((catKey) => (
                    <option key={catKey} value={catKey}>
                      {catKey}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Prioridad de Entrega
                </label>
                <div className="flex gap-1 bg-zinc-100/60 dark:bg-zinc-950/40 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60">
                  {(['Alta', 'Media', 'Baja'] as Priority[]).map((prio) => {
                    const isSelected = newPriority === prio;
                    return (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setNewPriority(prio)}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                      >
                        {prio}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Crear Tarea
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters HUD */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/5 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tarea por título o descripción..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
          />
        </div>

        {/* Pill Selectors */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/20">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer uppercase tracking-wider ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
              }`}
            >
              Todas ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer uppercase tracking-wider ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
              }`}
            >
              Pendientes ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer uppercase tracking-wider ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
              }`}
            >
              Completadas ({completedCount})
            </button>
          </div>

          <div className="flex gap-1.5 items-center">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-800 text-[10px] font-semibold rounded-lg text-zinc-650 dark:text-zinc-300"
            >
              <option value="all">Categorías (Todas)</option>
              {Object.keys(CATEGORIES).map((cat) => (
                <option key={`filter-${cat}`} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-800 text-[10px] font-semibold rounded-lg text-zinc-650 dark:text-zinc-300"
            >
              <option value="all">Prioridad (Todas)</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Tasks Body */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 max-h-[420px] dark:bg-zinc-900/10">
        <AnimatePresence initial={false}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const catDetails = CATEGORIES[task.project] || {
                color: '#6b7280',
                bgClass: 'bg-zinc-50 dark:bg-zinc-950/20',
                borderClass: 'border-zinc-200 dark:border-zinc-800/40',
                textClass: 'text-zinc-700 dark:text-zinc-300'
              };

              // Highlight matching row if active task in chronometer
              const isActive = activeTaskId === task.id;

              return (
                <motion.div
                  key={task.id}
                  id={`task-row-${task.id}`}
                  initial={{ opacity: 0, scale: 0.98, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -10 }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 ${
                    isActive
                      ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 shadow-xs shadow-blue-500/5 ring-1 ring-blue-400/30'
                      : 'border-zinc-150 dark:border-zinc-800 bg-white hover:bg-zinc-50/50 dark:bg-zinc-950/30 dark:hover:bg-zinc-950/60'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Tick Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleTaskCompletion(task.id)}
                      className="mt-0.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-zinc-900" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-350 hover:scale-105 transition" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Name with conditional line-through */}
                      <p
                        className={`text-xs font-semibold leading-relaxed transition ${
                          task.completed
                            ? 'text-zinc-400 dark:text-zinc-550 line-through decoration-zinc-300 dark:decoration-zinc-700 decoration-1'
                            : 'text-zinc-900 dark:text-white font-medium'
                        }`}
                      >
                        {task.title}
                      </p>

                      {/* Info lines (Category, Priority, Duration) */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {/* Project Category Tag */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${catDetails.bgClass} ${catDetails.borderClass} ${catDetails.textClass}`}
                        >
                          {task.project}
                        </span>

                        {/* Priority tag */}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            task.priority === 'Alta'
                              ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                              : task.priority === 'Media'
                              ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Accumulated Time tracker */}
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                          Trackeado: <span className="font-bold text-zinc-600 dark:text-zinc-400">{formatAccruedTime(task.timeSpent)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    {/* Quick Play for timer */}
                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() => onStartTracking(task.id)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                        title="Vincular temporizador a esta tarea"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    {/* Delete Task button */}
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-600 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed border-zinc-150 dark:border-zinc-800 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/5 p-4">
              <span className="p-3 bg-zinc-100 dark:bg-zinc-850 rounded-full mb-3 text-zinc-400">
                <ListTodo className="w-6 h-6" />
              </span>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                No se encontraron tareas
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed">
                {searchTerm
                  ? 'Prueba modificando la búsqueda o quitando los filtros de categoría y prioridad.'
                  : 'Empieza registrando tu primera tarea del día con el botón superior.'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

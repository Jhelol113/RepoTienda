import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, AlertCircle, FileText, Check, Calendar, Activity, Plus } from 'lucide-react';
import { Task, CATEGORIES, TimeLog, Priority } from '../types';

interface TimerWidgetProps {
  tasks: Task[];
  activeTaskId: string | null;
  onStartTracking: (taskId: string) => void;
  onAddLog: (log: Omit<TimeLog, 'id'>) => void;
  onAddTask: (title: string, project: string, priority: Priority) => void;
}

export function TimerWidget({ tasks, activeTaskId, onStartTracking, onAddLog, onAddTask }: TimerWidgetProps) {
  const [activeTab, setActiveTab] = useState<'chronometer' | 'manual'>('chronometer');
  
  // Chronometer State
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Desarrollo');
  const [logNotes, setLogNotes] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [startTime, setStartTime] = useState<string>('');

  // Manual State
  const [manualTaskId, setManualTaskId] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<string>('Desarrollo');
  const [manualHours, setManualHours] = useState<number>(0);
  const [manualMinutes, setManualMinutes] = useState<number>(0);
  const [manualDate, setManualDate] = useState<string>('2026-05-30'); // Anchor date
  const [manualNotes, setManualNotes] = useState('');
  const [manualSuccess, setManualSuccess] = useState(false);

  // Quick Task Creation Inline
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('Media');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with activeTaskId from task list "Play" button trigger
  useEffect(() => {
    if (activeTaskId) {
      const task = tasks.find(t => t.id === activeTaskId);
      if (task) {
        setSelectedTaskId(activeTaskId);
        setSelectedCategory(task.project);
        // Start playing automatically when triggered from list
        if (!isPlaying) {
          setStartTime(new Date().toISOString());
          setIsPlaying(true);
        }
      }
    }
  }, [activeTaskId, tasks]);

  // Keep interval active
  useEffect(() => {
    if (isPlaying) {
      if (!startTime) {
        setStartTime(new Date().toISOString());
      }
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, startTime]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (!isPlaying && seconds === 0) {
      setStartTime(new Date().toISOString());
    }
    setIsPlaying(!isPlaying);
  };

  // Format seconds to hh:mm:ss
  const formatSeconds = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Sync category if task selection changes
  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      const parentTask = tasks.find(t => t.id === taskId);
      if (parentTask) {
        setSelectedCategory(parentTask.project);
      }
    }
  };

  // Stop Chronometer & open notes sheet
  const handleStopAndPrepareSave = () => {
    setIsPlaying(false);
    setShowSaveForm(true);
  };

  // Reset Chronometer without saving
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que deseas reiniciar el temporizador? El tiempo transcurrido se perderá.')) {
      setSeconds(0);
      setIsPlaying(false);
      setShowSaveForm(false);
      setLogNotes('');
      setStartTime('');
    }
  };

  // Save Chronometer log
  const handleSaveTrackedTime = () => {
    if (seconds < 5) {
      alert('Por favor registra al menos 5 segundos para guardar el registro.');
      return;
    }

    const currentTask = tasks.find(t => t.id === selectedTaskId);
    const logData = {
      taskId: selectedTaskId || 'general',
      taskTitle: currentTask ? currentTask.title : 'Sesión General',
      project: selectedTaskId && currentTask ? currentTask.project : selectedCategory,
      startTime: startTime || new Date(Date.now() - seconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: seconds,
      notes: logNotes.trim() || undefined
    };

    onAddLog(logData);

    // Reset local state
    setSeconds(0);
    setLogNotes('');
    setShowSaveForm(false);
    setStartTime('');
    
    // Pulse animation/feedback
    const banner = document.getElementById('save-banner');
    if (banner) {
      banner.classList.remove('opacity-0');
      setTimeout(() => banner.classList.add('opacity-0'), 3000);
    }
  };

  // Create quick task and auto-select/start tracking it
  const handleCreateQuickTask = (e: FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    
    // We can generate a temporary reference id or pass it directly back.
    // To keep it simple, we add the task.
    onAddTask(quickTitle.trim(), selectedCategory, quickPriority);
    
    // The App component will create the task and we should wait a tick
    setQuickTitle('');
    setShowQuickTask(false);
  };

  // Save manual log
  const handleSaveManualLog = (e: FormEvent) => {
    e.preventDefault();
    const totalMins = (manualHours * 60) + manualMinutes;
    if (totalMins <= 0) {
      alert('Por favor ingresa una duración válida mayor de 0.');
      return;
    }

    const durationSec = totalMins * 60;
    const currentTask = tasks.find(t => t.id === manualTaskId);
    
    // Map date input to specific time
    const startObj = new Date(`${manualDate}T10:00:00`);
    const endObj = new Date(startObj.getTime() + durationSec * 1000);

    const logData = {
      taskId: manualTaskId || 'general',
      taskTitle: currentTask ? currentTask.title : 'Sesión General',
      project: manualTaskId && currentTask ? currentTask.project : manualCategory,
      startTime: startObj.toISOString(),
      endTime: endObj.toISOString(),
      duration: durationSec,
      notes: manualNotes.trim() || undefined
    };

    onAddLog(logData);

    // Reset Manual fields
    setManualHours(0);
    setManualMinutes(0);
    setManualNotes('');
    setManualSuccess(true);
    setTimeout(() => setManualSuccess(false), 3000);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
      {/* Tab Selectors */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40">
        <button
          onClick={() => setActiveTab('chronometer')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'chronometer'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Temporizador Activo
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'manual'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Registro Manual
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        {activeTab === 'chronometer' ? (
          <div className="space-y-6">
            {/* Stopwatch Numerical Display */}
            <div className="relative flex flex-col items-center py-6 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
              {/* Pulsing visual glow when tracking */}
              {isPlaying && (
                <div className="absolute inset-0 bg-blue-500/5 pulsing-ring rounded-xl pointer-events-none" />
              )}
              
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
                Tiempo Transcurrido
              </span>
              <span className="text-4xl sm:text-5xl font-bold font-mono tracking-wider text-zinc-900 dark:text-white transition-all">
                {formatSeconds(seconds)}
              </span>

              {isPlaying && (
                <div className="flex items-center gap-1.5 mt-2 bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-0.5 rounded-full">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wider">
                    Grabando...
                  </span>
                </div>
              )}
            </div>

            {/* Inputs & Settings */}
            {!showSaveForm ? (
              <div className="space-y-4">
                {/* 1. Select Associated Task */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                      Vincular a Tarea
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickTask(!showQuickTask)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Crear rápida
                    </button>
                  </div>

                  {/* Inline quick task form */}
                  <AnimatePresence>
                    {showQuickTask && (
                      <motion.form
                        onSubmit={handleCreateQuickTask}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 rounded-lg space-y-2.5 overflow-hidden"
                      >
                        <input
                          type="text"
                          required
                          value={quickTitle}
                          onChange={(e) => setQuickTitle(e.target.value)}
                          placeholder="Nombre de la nueva tarea..."
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex gap-2 items-center justify-between">
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] text-zinc-400">Prioridad:</span>
                            {(['Baja', 'Media', 'Alta'] as Priority[]).map((pri) => (
                              <button
                                key={pri}
                                type="button"
                                onClick={() => setQuickPriority(pri)}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded transition ${
                                  quickPriority === pri
                                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950'
                                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}
                              >
                                {pri}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setShowQuickTask(false)}
                              className="text-[10px] px-2 py-0.5 text-zinc-500 hover:underline"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-0.5 rounded transition"
                            >
                              Crear
                            </button>
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <select
                    value={selectedTaskId}
                    onChange={(e) => handleTaskChange(e.target.value)}
                    disabled={isPlaying}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:opacity-75 disabled:bg-zinc-50 dark:disabled:bg-zinc-950"
                  >
                    <option value="">-- Sesión independiente de tareas --</option>
                    {tasks.filter(t => !t.completed).map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title} ({task.project})
                      </option>
                    ))}
                    {tasks.filter(t => t.completed).length > 0 && <optgroup label="Tareas Completadas">
                      {tasks.filter(t => t.completed).map((task) => (
                        <option key={task.id} value={task.id}>
                          ✓ {task.title} ({task.project})
                        </option>
                      ))}
                    </optgroup>}
                  </select>
                </div>

                {/* 2. Select Category (Only enabled if no task is selected) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Categoría del Proyecto
                  </label>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {Object.keys(CATEGORIES).map((catName) => {
                      const cat = CATEGORIES[catName];
                      const isTaskBound = !!selectedTaskId;
                      // If task is bound, show active project category but disable click
                      const parentTask = tasks.find(t => t.id === selectedTaskId);
                      const isSelected = isTaskBound 
                        ? parentTask?.project === catName
                        : selectedCategory === catName;

                      return (
                        <button
                          key={catName}
                          type="button"
                          disabled={isTaskBound || isPlaying}
                          onClick={() => setSelectedCategory(catName)}
                          className={`py-2 px-1 rounded-xl text-[11px] font-medium border text-center transition flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-150 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                          } ${isTaskBound ? 'opacity-65' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer'}`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full mb-1 border border-white"
                            style={{ backgroundColor: cat.color }}
                          />
                          {catName}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTaskId && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-zinc-400" />
                      La categoría está asignada automáticamente por la tarea vinculada.
                    </span>
                  )}
                </div>

                {/* Chronometer Action Buttons */}
                <div className="flex gap-3 justify-center pt-3">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs shadow-xs transition hover:scale-[1.02] cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                    {isPlaying ? 'Pausar' : seconds > 0 ? 'Reanudar' : 'Iniciar'}
                  </button>

                  {seconds > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleStopAndPrepareSave}
                        className="bg-zinc-900 border border-zinc-700 dark:border-zinc-800 text-white hover:bg-zinc-800 dark:bg-zinc-850 py-3 px-4 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        Terminar
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="bg-zinc-150 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-3 px-4 rounded-xl font-semibold text-xs transition cursor-pointer"
                      >
                        Reiniciar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Save Form overlay */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-4 border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl"
              >
                <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4.5 h-4.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded p-0.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">¡Bloque completado con éxito!</span>
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Registrando <span className="font-bold text-zinc-900 dark:text-white font-mono">{formatSeconds(seconds)}</span> en{' '}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {selectedTaskId ? tasks.find(t => t.id === selectedTaskId)?.title : `Independiente (${selectedCategory})`}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    ¿Qué lograste en este tiempo? (Notas opcionales)
                  </label>
                  <textarea
                    rows={3}
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Ej. Avancé con la refactorización de tests JUnit, diseñé 3 tarjetas del bento..."
                    className="w-full text-xs p-3 border border-zinc-250 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowSaveForm(false)}
                    className="flex-1 py-2 text-xs font-semibold bg-zinc-150 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl transition hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    Volver al Cronómetro
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTrackedTime}
                    className="flex-1 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl shadow-xs transition hover:bg-blue-700 hover:scale-[1.01] cursor-pointer"
                  >
                    Guardar Registro
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Manual Entry Form */
          <form onSubmit={handleSaveManualLog} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-1.5 flex items-center gap-1">
                Vincular a Tarea (Opcional)
              </label>
              <select
                value={manualTaskId}
                onChange={(e) => {
                  setManualTaskId(e.target.value);
                  if (e.target.value) {
                    const parentTask = tasks.find(t => t.id === e.target.value);
                    if (parentTask) {
                      setManualCategory(parentTask.project);
                    }
                  }
                }}
                className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="">-- Sesión independiente de tareas --</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.completed ? '✓ ' : ''}{task.title} ({task.project})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-1.5">
                Categoría del Proyecto
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5">
                {Object.keys(CATEGORIES).map((catName) => {
                  const cat = CATEGORIES[catName];
                  const isTaskBound = !!manualTaskId;
                  const parentTask = tasks.find(t => t.id === manualTaskId);
                  const isSelected = isTaskBound 
                    ? parentTask?.project === catName
                    : manualCategory === catName;

                  return (
                    <button
                      key={`manual-${catName}`}
                      type="button"
                      disabled={isTaskBound}
                      onClick={() => setManualCategory(catName)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-medium border text-center transition flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-150 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      } ${isTaskBound ? 'opacity-65' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer'}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full mb-1 border border-white"
                        style={{ backgroundColor: cat.color }}
                      />
                      {catName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-1">
                  Horas
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  required
                  value={manualHours}
                  onChange={(e) => setManualHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-1">
                  Minutos
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  required
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-1">
                Fecha de Actividad
              </label>
              <input
                type="date"
                required
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Notas del Registro
              </label>
              <textarea
                rows={2}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Ej. Redacté el sumario ejecutivo de la reunión financiera..."
                className="w-full text-xs p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ingresar Registro Manual
            </button>

            {manualSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-center text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                ✓ Registro guardado correctamente
              </motion.div>
            )}
          </form>
        )}
      </div>

      {/* Hidden banner for chronometer feedback */}
      <div 
        id="save-banner"
        className="opacity-0 transition-opacity duration-300 absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-lg flex items-center gap-1.5 z-50 pointer-events-none"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        ¡Registro añadido con éxito!
      </div>
    </div>
  );
}

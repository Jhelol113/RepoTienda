import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Search, CalendarClock, Edit2, Check, X, FileText, ChevronDown } from 'lucide-react';
import { TimeLog, CATEGORIES } from '../types';

interface LogHistoryListProps {
  logs: TimeLog[];
  onDeleteLog: (logId: string) => void;
  onUpdateLogNotes: (logId: string, notes: string) => void;
}

export function LogHistoryList({ logs, onDeleteLog, onUpdateLogNotes }: LogHistoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Inline edit state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Format Helpers
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = '';
    if (hrs > 0) result += `${hrs}h `;
    if (mins > 0 || hrs > 0) result += `${mins}m `;
    if (hrs === 0 && mins === 0) result += `${secs}s`;
    return result.trim();
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  // Sort logs in reverse chronological (newest first)
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  // Filter logs logic
  const filteredLogs = sortedLogs.filter(log => {
    const matchesSearch = 
      log.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCat = categoryFilter === 'all' || log.project === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const handleStartEdit = (log: TimeLog) => {
    setEditingLogId(log.id);
    setTempNotes(log.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setTempNotes('');
  };

  const handleSaveEdit = (logId: string) => {
    onUpdateLogNotes(logId, tempNotes.trim());
    setEditingLogId(null);
    setTempNotes('');
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden h-full">
      {/* Header with quick stats */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-pink-500/10 rounded-lg">
            <CalendarClock className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white">
            Historial de Sesiones
          </h2>
        </div>
        <span className="text-[10px] bg-zinc-150 dark:bg-zinc-850 px-2 py-0.5 rounded-full font-mono text-zinc-550 font-bold">
          {logs.length} bloques
        </span>
      </div>

      {/* Filter panel */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en descripción o nombre de tarea..."
            className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category selector */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="col-span-1 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-xl text-zinc-650 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans font-semibold"
        >
          <option value="all">Categorías (Todas)</option>
          {Object.keys(CATEGORIES).map(catKey => (
            <option key={`log-filt-${catKey}`} value={catKey}>
              {catKey}
            </option>
          ))}
        </select>
      </div>

      {/* Interactive Item list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[350px]">
        <AnimatePresence initial={false}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const catDetails = CATEGORIES[log.project] || {
                color: '#6b7280',
                bgClass: 'bg-zinc-50 dark:bg-zinc-950/20',
                borderClass: 'border-zinc-200 dark:border-zinc-800/40',
                textClass: 'text-zinc-700 dark:text-zinc-300'
              };

              const isEditing = editingLogId === log.id;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-3.5 border border-zinc-150 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/20 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/40 transition flex flex-col gap-2 relative group"
                >
                  {/* Row Top Header: Title, Category, Duration */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {log.taskTitle}
                      </p>
                      
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Project Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold border ${catDetails.bgClass} ${catDetails.borderClass} ${catDetails.textClass}`}>
                          {log.project}
                        </span>
                        {/* Log Date */}
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {formatDate(log.startTime)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Formatted Hours Tracker indicator */}
                      <span className="px-2.5 py-1 rounded bg-zinc-50 dark:bg-zinc-850 font-mono text-[11px] font-bold text-zinc-850 dark:text-zinc-200">
                        {formatDuration(log.duration)}
                      </span>

                      {/* Quiet log action row (shows on hover/always on mobile) */}
                      <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(log)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title="Editar notas de sesión"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                          title="Eliminar este bloque"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes description block */}
                  <div className="pt-1.5 border-t border-zinc-100/60 dark:border-zinc-800/40">
                    {isEditing ? (
                      /* Editing window form */
                      <div className="space-y-2 mt-1.5">
                        <textarea
                          rows={2}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Agregue apuntes de esta sesión..."
                          className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-650 flex items-center gap-0.5 text-[10px] font-bold"
                          >
                            <X className="w-3 h-3" /> Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(log.id)}
                            className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <Check className="w-3 h-3" /> Guardar Notas
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display text */
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed italic flex items-start gap-1">
                        <FileText className="w-3.5 h-3.5 text-zinc-350 dark:text-zinc-550 flex-shrink-0 mt-0.5" />
                        <span>
                          {log.notes || 'Completado sin notas o anotaciones adicionales.'}
                        </span>
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-zinc-150 dark:border-zinc-800 rounded-xl bg-zinc-50/20 p-4">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                Ninguna sesión registrada
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                No se encontraron actividades registradas con los filtros vigentes.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

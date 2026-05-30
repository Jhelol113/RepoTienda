import { motion } from 'motion/react';
import { Clock, CheckSquare, TrendingUp, Sparkles } from 'lucide-react';
import { Task, TimeLog, CATEGORIES } from '../types';

interface MetricCardsProps {
  tasks: Task[];
  logs: TimeLog[];
}

export function MetricCards({ tasks, logs }: MetricCardsProps) {
  // Helper to format seconds to human-readable format
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  // 1. Total hours tracked
  const totalSeconds = logs.reduce((sum, log) => sum + log.duration, 0);

  // 2. Time spent today (May 30, 2026)
  const todayStr = '2026-05-30';
  const todaySeconds = logs
    .filter(log => log.startTime.startsWith(todayStr))
    .reduce((sum, log) => sum + log.duration, 0);

  // 3. Task completion rate
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 4. Most active category
  const categoryDurations: Record<string, number> = {};
  logs.forEach(log => {
    categoryDurations[log.project] = (categoryDurations[log.project] || 0) + log.duration;
  });

  let topCategory = 'Ninguna';
  let maxDuration = 0;
  Object.entries(categoryDurations).forEach(([cat, duration]) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      topCategory = cat;
    }
  });

  const cards = [
    {
      id: 'metric-total',
      title: 'Tiempo Total Trackeado',
      value: formatTime(totalSeconds),
      description: 'Acumulado en todos los proyectos',
      icon: Clock,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    },
    {
      id: 'metric-today',
      title: 'Productividad de Hoy',
      value: formatTime(todaySeconds),
      description: 'Objetivo diario sugerido: 4h',
      icon: Sparkles,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      status: todaySeconds >= 14400 ? '¡Meta lograda!' : 'En progreso',
    },
    {
      id: 'metric-tasks',
      title: 'Tasa de Completado',
      value: `${completionRate}%`,
      description: `${completedTasks} de ${totalTasks} tareas resueltas`,
      icon: CheckSquare,
      color: 'text-pink-500 dark:text-pink-400',
      bg: 'bg-pink-500/10 dark:bg-pink-500/20',
      progress: completionRate,
    },
    {
      id: 'metric-category',
      title: 'Foco Principal',
      value: topCategory,
      description: maxDuration > 0 ? `Duración: ${formatTime(maxDuration)}` : 'Sin registros de tiempo',
      icon: TrendingUp,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.id}
            id={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold font-display mt-2 text-zinc-950 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <IconComponent className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-sans">
                {card.description}
              </span>
              {card.status && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  todaySeconds >= 14400 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}>
                  {card.status}
                </span>
              )}
              {card.progress !== undefined && (
                <div className="w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-pink-500 h-full transition-all duration-500" 
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

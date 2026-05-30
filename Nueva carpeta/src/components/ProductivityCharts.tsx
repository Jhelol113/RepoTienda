import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, LineChart as LineIcon, Activity, Sparkles, Milestone } from 'lucide-react';
import { Task, TimeLog, CATEGORIES } from '../types';

interface ProductivityChartsProps {
  tasks: Task[];
  logs: TimeLog[];
}

export function ProductivityCharts({ tasks, logs }: ProductivityChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState<'daily' | 'categories' | 'velocity'>('daily');

  // Format Helper: Seconds to simple hours (e.g. 1.5h)
  const toHours = (seconds: number) => {
    return parseFloat((seconds / 3600).toFixed(2));
  };

  // Helper to format days in Spanish
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Pivot last 7 days ending Saturday, May 30, 2026
  const getDailyDistribution = () => {
    const daysData = [];
    const dateAnchor = new Date('2026-05-30T12:00:00'); // Steady anchor midday

    for (let i = 6; i >= 0; i--) {
      const d = new Date(dateAnchor);
      d.setDate(dateAnchor.getDate() - i);
      const isostring = d.toISOString().split('T')[0]; // "YYYY-MM-DD"
      
      const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;

      // Initialize category buckets
      const dayTotals: any = {
        name: dayLabel,
        date: isostring,
        'Desarrollo': 0,
        'Diseño': 0,
        'Reunión': 0,
        'Aprendizaje': 0,
        'Administración': 0,
      };

      // Filter and sum up logs
      const dayLogs = logs.filter(log => log.startTime.startsWith(isostring));
      dayLogs.forEach(log => {
        if (dayTotals[log.project] !== undefined) {
          dayTotals[log.project] += toHours(log.duration);
        }
      });

      // Include completions count for that day too
      // (Assume completed tasks completed on their created date, or simulate for richness)
      const dayCompletions = tasks.filter(t => t.completed && t.createdAt.startsWith(isostring)).length;
      dayTotals['Completos'] = dayCompletions;

      daysData.push(dayTotals);
    }
    return daysData;
  };

  // Distribution by Category pie data
  const getCategoryDistribution = () => {
    const data: Record<string, { name: string; value: number; color: string; count: number }> = {};
    
    // Seed all categories
    Object.keys(CATEGORIES).forEach(catName => {
      data[catName] = { 
        name: catName, 
        value: 0, 
        color: CATEGORIES[catName].color,
        count: 0 
      };
    });

    logs.forEach(log => {
      if (data[log.project]) {
        data[log.project].value += toHours(log.duration);
        data[log.project].count += 1;
      }
    });

    // Filter categories with 0 logged time so the chart doesn't crowd empty sectors
    return Object.values(data).filter(item => item.value > 0);
  };

  // Productivity Velocity (Compare trend of tracked time vs completed tasks cumulatively)
  const getVelocityData = () => {
    const daysData = getDailyDistribution();
    let cumulativeHours = 0;
    let cumulativeCompleted = 0;

    return daysData.map(day => {
      const sumHours = 
        Number(day['Desarrollo']) + 
        Number(day['Diseño']) + 
        Number(day['Reunión']) + 
        Number(day['Aprendizaje']) + 
        Number(day['Administración']);

      cumulativeHours = parseFloat((cumulativeHours + sumHours).toFixed(1));
      cumulativeCompleted += Number(day['Completos'] || 0);

      return {
        name: day.name,
        'Horas Acumuladas': cumulativeHours,
        'Tareas Resueltas': cumulativeCompleted,
      };
    });
  };

  const dailyChartData = getDailyDistribution();
  const categoryChartData = getCategoryDistribution();
  const velocityChartData = getVelocityData();

  // Grand Total Tracked Hours
  const totalSeconds = logs.reduce((sum, log) => sum + log.duration, 0);
  const totalHoursFloat = parseFloat((totalSeconds / 3600).toFixed(1));

  // Custom tooltips to keep the look incredibly sleek
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 dark:bg-zinc-900 text-white p-3 rounded-xl border border-zinc-800 text-xs shadow-xl space-y-1">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
              <span className="text-zinc-300">{entry.name}:</span>
              <span className="font-bold">{entry.value} {entry.name === 'Tareas Resueltas' ? 'tareas' : 'horas'}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden h-full">
      {/* Chart Control Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 rounded-lg">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white">
              Análisis de Productividad
            </h2>
            <p className="text-[10px] text-zinc-400">Total monitoreado: {totalHoursFloat} horas</p>
          </div>
        </div>

        {/* Buttons to switch charts */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200/25">
          <button
            onClick={() => setActiveChartTab('daily')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition duration-150 flex items-center gap-1 cursor-pointer uppercase ${
              activeChartTab === 'daily'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Distribución Diaria
          </button>
          <button
            onClick={() => setActiveChartTab('categories')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition duration-150 flex items-center gap-1 cursor-pointer uppercase ${
              activeChartTab === 'categories'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Proyectos
          </button>
          <button
            onClick={() => setActiveChartTab('velocity')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition duration-150 flex items-center gap-1 cursor-pointer uppercase ${
              activeChartTab === 'velocity'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            Tendencia
          </button>
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="p-6 flex-1 flex flex-col justify-center min-h-[300px]">
        {logs.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-zinc-150 dark:border-zinc-800 rounded-xl bg-zinc-50/20 p-4">
            <span className="p-3 bg-zinc-100 dark:bg-zinc-850 rounded-full mb-3 text-zinc-400">
              <Activity className="w-6 h-6" />
            </span>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">Sin datos de tiempo suficientes</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
              Activa el cronómetro o registra un bloque de horas de manera manual para inaugurar la generación automatizada de estadísticas.
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Chart Render Wrapper */}
            <div className="w-full flex-1 h-[225px] relative">
              {activeChartTab === 'daily' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800/60" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#888', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#888', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="Desarrollo" stackId="a" fill={CATEGORIES['Desarrollo'].color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Diseño" stackId="a" fill={CATEGORIES['Diseño'].color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Reunión" stackId="a" fill={CATEGORIES['Reunión'].color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Aprendizaje" stackId="a" fill={CATEGORIES['Aprendizaje'].color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Administración" stackId="a" fill={CATEGORIES['Administración'].color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeChartTab === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-full">
                  <div className="h-[210px] w-full flex justify-center items-center relative">
                    {/* Ring background detail */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-bold font-display text-zinc-950 dark:text-white">
                        {totalHoursFloat}h
                      </span>
                      <span className="text-[9px] text-zinc-400 uppercase font-semibold">Trackeadas</span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Legend table */}
                  <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Distribución de Foco
                    </p>
                    {categoryChartData.map((item, index) => {
                      const share = Math.round((item.value / totalHoursFloat) * 100);
                      return (
                        <div key={`legend-${index}`} className="flex items-center justify-between text-[11px] py-1 border-b border-zinc-100 dark:border-zinc-800/40">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.name}</span>
                          </div>
                          <div className="text-right font-mono text-zinc-900 dark:text-white">
                            <span className="font-bold">{item.value.toFixed(1)}h</span>
                            <span className="text-zinc-400 text-[10px] ml-1">({share}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeChartTab === 'velocity' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={velocityChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800/60" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#888', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#888', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="Horas Acumuladas"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Tareas Resueltas"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Quick Summary insight line */}
            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 rounded-xl flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Milestone className="w-3.5 h-3.5 text-blue-500" />
                <span>Rendimiento Promedio Semanal:</span>
                <span className="font-bold font-sans text-zinc-900 dark:text-white">
                  {(totalHoursFloat / 7).toFixed(1)} horas/día
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/25 px-2 py-0.5 rounded-full">
                {totalHoursFloat >= 15 ? 'Ritmo Óptimo ✓' : 'Meta semanal de 15h'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { SpendingAnalytics, Category } from '../types';
import { formatINR } from '../utils/currency';
import { BarChart3, PieChart, ArrowUpRight } from 'lucide-react';

Chart.register(...registerables);

interface ChartsViewProps {
  analytics: SpendingAnalytics;
  darkMode: boolean;
  onSelectCategory?: (category: Category) => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ analytics, darkMode, onSelectCategory }) => {
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const donutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstance = useRef<Chart | null>(null);
  const donutChartInstance = useRef<Chart | null>(null);
  const [activeView, setActiveView] = useState<'both' | 'trends' | 'breakdown'>('both');

  // Neutral Linear-inspired category colors
  const palette = [
    '#2563EB', // Blue
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#F43F5E', // Rose
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#64748B', // Slate
  ];

  // 1. Monthly Trends Bar Chart
  useEffect(() => {
    if (!barCanvasRef.current) return;

    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    const ctx = barCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const textColor = darkMode ? '#94A3B8' : '#64748B';
    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const barColor = darkMode ? '#E2E8F0' : '#1E293B';
    const barHoverColor = darkMode ? '#FFFFFF' : '#0F172A';

    const labels = analytics.monthlyTrends.map((t) => t.month);
    const data = analytics.monthlyTrends.map((t) => t.amount);

    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly Spend',
            data,
            backgroundColor: barColor,
            hoverBackgroundColor: barHoverColor,
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 44,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: darkMode ? '#0F172A' : '#1E293B',
            titleColor: '#F8FAFC',
            bodyColor: '#F8FAFC',
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' },
            bodyFont: { family: 'JetBrains Mono', size: 13 },
            callbacks: {
              label: (context) => {
                const val = (context.raw as number) || 0;
                return ` Spending: ${formatINR(val)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 12 },
            },
            border: { display: false },
          },
          y: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
              font: { family: 'JetBrains Mono', size: 11 },
              callback: (val) => {
                const num = Number(val);
                if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
                if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
                return `₹${num}`;
              },
            },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, [analytics.monthlyTrends, darkMode]);

  // 2. Category Distribution Doughnut Chart
  useEffect(() => {
    if (!donutCanvasRef.current) return;

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    const ctx = donutCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const breakdown = analytics.categoryBreakdown;
    const labels = breakdown.map((b) => b.category);
    const data = breakdown.map((b) => b.amount);
    const backgroundColors = breakdown.map((_, i) => palette[i % palette.length]);

    donutChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: data.length > 0 ? data : [1],
            backgroundColor: data.length > 0 ? backgroundColors : [darkMode ? '#334155' : '#E2E8F0'],
            borderWidth: 2,
            borderColor: darkMode ? '#171717' : '#FFFFFF',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: data.length > 0,
            backgroundColor: darkMode ? '#0F172A' : '#1E293B',
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'Plus Jakarta Sans', size: 12 },
            bodyFont: { family: 'JetBrains Mono', size: 13 },
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const val = (context.raw as number) || 0;
                const percentage = analytics.total > 0 ? ((val / analytics.total) * 100).toFixed(1) : '0';
                return ` ${label}: ${formatINR(val)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
    };
  }, [analytics.categoryBreakdown, analytics.total, darkMode]);

  return (
    <div className="space-y-6">
      {/* Visualizations Filter Subheader */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Financial Visualizations
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time monthly cadence and category distribution in Indian Rupees (₹)
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveView('both')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'both'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All Charts
          </button>
          <button
            onClick={() => setActiveView('trends')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'trends'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Monthly Trend
          </button>
          <button
            onClick={() => setActiveView('breakdown')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'breakdown'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Category Share
          </button>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Chart */}
        {(activeView === 'both' || activeView === 'trends') && (
          <div
            className={`p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all ${
              activeView === 'trends' ? 'lg:col-span-12' : 'lg:col-span-7'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Monthly Spending Trends
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                Last 6 months
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full relative">
              <canvas ref={barCanvasRef} />
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>Peak Month: {analytics.monthlyTrends.reduce((max, t) => (t.amount > max.amount ? t : max), { month: '-', amount: 0 }).month}</span>
              <span className="font-mono tabular-nums">
                Total Tracked: {formatINR(analytics.total)}
              </span>
            </div>
          </div>
        )}

        {/* Category Breakdown Doughnut Chart */}
        {(activeView === 'both' || activeView === 'breakdown') && (
          <div
            className={`p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all ${
              activeView === 'breakdown' ? 'lg:col-span-12' : 'lg:col-span-5'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Category Distribution
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                {analytics.categoryBreakdown.length} Categories
              </span>
            </div>

            <div className="h-52 w-full relative flex items-center justify-center">
              <canvas ref={donutCanvasRef} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-neutral-400 font-medium">TOTAL</span>
                <span className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                  {formatINR(analytics.total, { compact: true })}
                </span>
              </div>
            </div>

            {/* Category breakdown table list */}
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
              {analytics.categoryBreakdown.map((item, idx) => (
                <div
                  key={item.category}
                  onClick={() => onSelectCategory && onSelectCategory(item.category)}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: palette[idx % palette.length] }}
                    />
                    <span className="truncate text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                      {formatINR(item.amount)}
                    </span>
                    <span className="font-mono text-neutral-400 tabular-nums w-9 text-right">
                      {item.percentage}%
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

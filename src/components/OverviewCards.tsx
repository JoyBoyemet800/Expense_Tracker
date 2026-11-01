import React from 'react';
import { SpendingAnalytics } from '../types';
import { formatINR } from '../utils/currency';
import { TrendingUp, TrendingDown, Calendar, Wallet, PieChart, Clock } from 'lucide-react';

interface OverviewCardsProps {
  analytics: SpendingAnalytics;
  totalExpensesCount: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ analytics, totalExpensesCount }) => {
  const isPositiveChange = analytics.monthlyChangePercent > 0;
  const currentMonthName = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Expenses */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
          <span className="text-xs font-medium tracking-wide">TOTAL EXPENSES</span>
          <Wallet className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-50 tracking-tight">
          {formatINR(analytics.total)}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{totalExpensesCount} recorded entries</span>
          <span aria-hidden="true">·</span>
          <span>All time</span>
        </div>
      </div>

      {/* Card 2: Monthly Spending */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
          <span className="text-xs font-medium tracking-wide">MONTHLY SPENDING</span>
          <Calendar className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-50 tracking-tight">
          {formatINR(analytics.monthlyTotal)}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="truncate">{currentMonthName}</span>
          {analytics.lastMonthTotal > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span
                className={`inline-flex items-center gap-0.5 font-medium ${
                  isPositiveChange ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isPositiveChange ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(analytics.monthlyChangePercent)}% vs prev
              </span>
            </>
          )}
        </div>
      </div>

      {/* Card 3: Daily Average */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
          <span className="text-xs font-medium tracking-wide">DAILY RUN RATE</span>
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-50 tracking-tight">
          {formatINR(analytics.dailyAverage)}
          <span className="text-xs font-normal text-neutral-400 font-sans ml-1">/ day</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span>Current month burn rate</span>
          <span aria-hidden="true">·</span>
          <span>Day {new Date().getDate()}</span>
        </div>
      </div>

      {/* Card 4: Top Category */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
          <span className="text-xs font-medium tracking-wide">TOP EXPENSE CATEGORY</span>
          <PieChart className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight truncate">
          {analytics.topCategory ? analytics.topCategory.category : 'None yet'}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {analytics.topCategory ? (
            <>
              <span className="font-mono tabular-nums font-medium text-neutral-800 dark:text-neutral-200">
                {formatINR(analytics.topCategory.amount)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{analytics.topCategory.percentage}% of overall</span>
            </>
          ) : (
            <span>Add expenses to see distribution</span>
          )}
        </div>
      </div>
    </div>
  );
};

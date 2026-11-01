import React, { useState, useMemo } from 'react';
import { Expense, Category } from '../types';
import { formatINR } from '../utils/currency';
import { CATEGORIES } from '../utils/categorizer';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ArrowUpDown,
  FileSpreadsheet,
  FileCode,
  Calendar,
} from 'lucide-react';

interface TransactionListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onOpenNewExpense: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  expenses,
  onEdit,
  onDelete,
  onOpenNewExpense,
  onExportCSV,
  onExportJSON,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Compute filtered list
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const currentYearKey = `${now.getFullYear()}`;

    return expenses
      .filter((exp) => {
        // Search text
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          const matchTitle = exp.title.toLowerCase().includes(s);
          const matchNotes = (exp.notes || '').toLowerCase().includes(s);
          const matchCat = exp.category.toLowerCase().includes(s);
          if (!matchTitle && !matchNotes && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && exp.category !== selectedCategory) {
          return false;
        }

        // Date range
        const expMonth = exp.date.substring(0, 7);
        if (dateFilter === 'this_month' && expMonth !== currentMonthKey) return false;
        if (dateFilter === 'last_month' && expMonth !== lastMonthKey) return false;
        if (dateFilter === 'this_year' && !exp.date.startsWith(currentYearKey)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        return b.date.localeCompare(a.date);
      });
  }, [expenses, searchTerm, selectedCategory, dateFilter, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter expenses by title, brand, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Quick Date Range Filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium shrink-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'this_year', label: 'This Year' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setDateFilter(item.id as any)}
                className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  dateFilter === item.id
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onExportCSV}
                title="Export filtered records as CSV"
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={onExportJSON}
                title="Export filtered records as JSON"
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Segment */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Summary Kicker */}
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
        <div>
          Showing <strong>{filteredExpenses.length}</strong> of {expenses.length} records
          {selectedCategory !== 'All' && <span> · Filtered by {selectedCategory}</span>}
        </div>
        <div>
          Filtered Total:{' '}
          <span className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
            {formatINR(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* Transactions Data Table / List */}
      <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/80">
        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              No expenses matching your criteria
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Try adjusting your search query, clearing filters, or record a new expense.
            </p>
            <button
              onClick={onOpenNewExpense}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              Record First Expense
            </button>
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const formattedDate = new Intl.DateTimeFormat('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).format(new Date(exp.date));

            return (
              <div
                key={exp.id}
                className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group"
              >
                {/* Left: Title & unboxed metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {exp.title}
                    </span>
                  </div>

                  {/* Anti-Slop Zero-Pill Metadata with subtle typographic separators */}
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-wrap">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {exp.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{formattedDate}</span>
                    {exp.notes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate italic text-neutral-400 dark:text-neutral-500 max-w-xs">
                          {exp.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Amount in INR & Quick Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                    {formatINR(exp.amount)}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(exp)}
                      title="Edit expense"
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {deletingId === exp.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-md border border-rose-200 dark:border-rose-900">
                        <button
                          onClick={() => confirmDelete(exp.id)}
                          className="px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-1 text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(exp.id)}
                        title="Delete expense"
                        className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

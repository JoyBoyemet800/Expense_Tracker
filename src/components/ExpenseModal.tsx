import React, { useState, useEffect } from 'react';
import { Expense, Category } from '../types';
import { CATEGORIES, autoSuggestCategory } from '../utils/categorizer';
import { X, Sparkles, IndianRupee, Calendar, Tag, FileText, Check } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  editingExpense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [autoSuggested, setAutoSuggested] = useState<{ category: Category; keyword: string } | null>(null);
  const [userManuallySelectedCategory, setUserManuallySelectedCategory] = useState(false);

  // Sync state when editing or opening
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setNotes(editingExpense.notes || '');
      setUserManuallySelectedCategory(true);
      setAutoSuggested(null);
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setUserManuallySelectedCategory(false);
      setAutoSuggested(null);
    }
  }, [editingExpense, isOpen]);

  // Live Smart Categorization on title change
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!userManuallySelectedCategory || !editingExpense) {
      const match = autoSuggestCategory(val);
      if (match) {
        setCategory(match.category);
        setAutoSuggested({ category: match.category, keyword: match.keywordMatched });
      } else {
        setAutoSuggested(null);
      }
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setUserManuallySelectedCategory(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave(
      {
        title: title.trim(),
        amount: parsedAmount,
        category,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes.trim(),
      },
      editingExpense?.id
    );
    onClose();
  };

  const addPresetAmount = (increment: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + increment).toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Amounts recorded in Indian Rupees (₹)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Expense Title / Merchant
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Swiggy Gourmet, Uber to Office, Zerodha SIP..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>

            {/* Smart Auto-Suggestion chip */}
            {autoSuggested && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Smart Match: <strong>{autoSuggested.category}</strong> based on &ldquo;{autoSuggested.keyword}&rdquo;
                </span>
              </div>
            )}
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-base font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all font-semibold"
              />
            </div>

            {/* Quick Presets */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-neutral-400 mr-1">Quick add:</span>
              {[100, 500, 1000, 2000, 5000].map((inc) => (
                <button
                  type="button"
                  key={inc}
                  onClick={() => addPresetAmount(inc)}
                  className="px-2 py-0.5 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
                >
                  +{inc}
                </button>
              ))}
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-2.5 py-2 text-xs font-medium rounded-lg text-left transition-all border flex items-center justify-between cursor-pointer ${
                    category === cat
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs font-semibold'
                      : 'bg-neutral-50 dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {category === cat && <Check className="w-3 h-3 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Notes row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid via UPI / split with Rahul"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-lg shadow-sm transition-all cursor-pointer font-semibold"
            >
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

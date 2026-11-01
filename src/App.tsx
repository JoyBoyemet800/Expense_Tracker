/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Expense, GitHubConfig, GitHubSyncState, Category } from './types';
import { INITIAL_EXPENSES } from './utils/initialData';
import { calculateAnalytics } from './utils/analytics';
import {
  verifyGitHubRepo,
  pushExpensesToGitHub,
  fetchFileFromGitHub,
  expensesToCSV,
} from './utils/github';
import { Navbar } from './components/Navbar';
import { OverviewCards } from './components/OverviewCards';
import { ChartsView } from './components/ChartsView';
import { TransactionList } from './components/TransactionList';
import { GitHubSettingsModal } from './components/GitHubSettingsModal';
import { PythonExportModal } from './components/PythonExportModal';
import { ExpenseModal } from './components/ExpenseModal';
import { formatINR } from './utils/currency';
import {
  GitCommit,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const STORAGE_KEY_EXPENSES = 'kuber_expenses_data_v1';
const STORAGE_KEY_GH = 'kuber_github_config_v1';
const STORAGE_KEY_THEME = 'kuber_dark_theme_v1';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'charts' | 'github' | 'python'>('overview');

  // Expense state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved expenses:', e);
    }
    return INITIAL_EXPENSES;
  });

  // GitHub Config state
  const [gitHubConfig, setGitHubConfig] = useState<GitHubConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GH);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse GitHub config:', e);
    }
    return {
      pat: '',
      owner: '',
      repo: '',
      branch: 'main',
      path: 'expenses.json',
      format: 'json',
      autoSync: false,
    };
  });

  // GitHub Sync Status state
  const [syncState, setSyncState] = useState<GitHubSyncState>({
    status: 'idle',
  });

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Quick toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  // Sync Dark Mode to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, String(darkMode));
  }, [darkMode]);

  // Persist Expenses
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  // Persist GitHub Config
  const handleUpdateGitHubConfig = (newConfig: GitHubConfig) => {
    setGitHubConfig(newConfig);
    localStorage.setItem(STORAGE_KEY_GH, JSON.stringify(newConfig));
  };

  // Computed Analytics
  const analytics = useMemo(() => {
    return calculateAnalytics(expenses);
  }, [expenses]);

  // GitHub Auto-Sync helper
  const triggerAutoSync = async (updatedExpenses: Expense[]) => {
    if (!gitHubConfig.autoSync || !gitHubConfig.pat || !gitHubConfig.owner || !gitHubConfig.repo) {
      return;
    }

    setSyncState((prev) => ({ ...prev, status: 'syncing', errorMessage: undefined }));
    const result = await pushExpensesToGitHub(gitHubConfig, updatedExpenses, {
      knownSha: syncState.fileSha,
    });

    if (result.success) {
      setSyncState({
        status: 'success',
        lastSyncedAt: new Date().toISOString(),
        lastCommitSha: result.commitSha,
        lastCommitUrl: result.commitUrl,
        fileSha: result.newFileSha,
      });
      showToast(`Auto-committed to GitHub (${result.commitSha})`);
    } else {
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: result.error,
      }));
    }
  };

  // Add or Edit Expense
  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    let updated: Expense[];
    const nowIso = new Date().toISOString();

    if (id) {
      // Edit
      updated = expenses.map((e) =>
        e.id === id ? { ...e, ...expenseData, updatedAt: nowIso } : e
      );
      showToast(`Updated expense: ${expenseData.title}`);
    } else {
      // Create new
      const newExpense: Expense = {
        ...expenseData,
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updated = [newExpense, ...expenses];
      showToast(`Logged ₹${expenseData.amount} for ${expenseData.title}`);
    }

    setExpenses(updated);
    setEditingExpense(null);
    triggerAutoSync(updated);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    showToast(`Deleted expense: ${target?.title || 'record'}`);
    triggerAutoSync(updated);
  };

  // Verify GitHub Repo Connection
  const handleVerifyGitHub = async () => {
    setSyncState((prev) => ({ ...prev, status: 'testing', errorMessage: undefined }));
    const res = await verifyGitHubRepo(gitHubConfig);
    if (res.valid) {
      setSyncState((prev) => ({
        ...prev,
        status: 'idle',
        errorMessage: undefined,
      }));
      showToast(`Verified connection to repository "${res.repoName}"`);
    } else {
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: res.error,
      }));
    }
  };

  // Push to GitHub
  const handlePushToGitHub = async () => {
    setSyncState((prev) => ({ ...prev, status: 'syncing', errorMessage: undefined }));
    const result = await pushExpensesToGitHub(gitHubConfig, expenses, {
      knownSha: syncState.fileSha,
    });

    if (result.success) {
      setSyncState({
        status: 'success',
        lastSyncedAt: new Date().toISOString(),
        lastCommitSha: result.commitSha,
        lastCommitUrl: result.commitUrl,
        fileSha: result.newFileSha,
      });
      showToast(`Pushed ${expenses.length} records to GitHub repository!`);
    } else {
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: result.error,
      }));
    }
  };

  // Pull from GitHub
  const handlePullFromGitHub = async () => {
    setSyncState((prev) => ({ ...prev, status: 'pulling', errorMessage: undefined }));
    const result = await fetchFileFromGitHub(gitHubConfig);

    if (result.success && result.expenses) {
      if (result.expenses.length > 0) {
        setExpenses(result.expenses);
        showToast(`Pulled ${result.expenses.length} records from GitHub`);
      } else {
        showToast('Repository file is currently empty');
      }
      setSyncState((prev) => ({
        ...prev,
        status: 'success',
        fileSha: result.sha,
        lastSyncedAt: new Date().toISOString(),
      }));
    } else {
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: result.error,
      }));
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const csv = expensesToCSV(expenses);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kuber_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported expenses to CSV file');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(expenses, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kuber_expenses_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported expenses to JSON file');
  };

  const isGitHubConfigured = Boolean(
    gitHubConfig.pat && gitHubConfig.owner && gitHubConfig.repo
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        gitHubConnected={isGitHubConfigured}
        autoSyncEnabled={gitHubConfig.autoSync}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-medium shadow-xl border border-neutral-700 dark:border-neutral-200 animate-slide-up flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Header Hero Kicker */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Financial Ledger & Overview
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Tracking in Indian Rupees (₹) · Backed by GitHub cloud version control
                </p>
              </div>

              {/* GitHub Status pill */}
              <div className="flex items-center gap-2">
                {isGitHubConfigured ? (
                  <button
                    onClick={() => setActiveTab('github')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
                  >
                    <GitCommit className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="font-mono">{gitHubConfig.owner}/{gitHubConfig.repo}</span>
                    {syncState.lastCommitSha && (
                      <span className="text-neutral-400">({syncState.lastCommitSha})</span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('github')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Connect GitHub Repository</span>
                  </button>
                )}
              </div>
            </div>

            {/* High-Level Overview Metric Cards */}
            <OverviewCards analytics={analytics} totalExpensesCount={expenses.length} />

            {/* Visualizations preview */}
            <ChartsView analytics={analytics} darkMode={darkMode} />

            {/* Recent Expenses List snippet */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Recent Ledger Entries
                </h2>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View All & Filter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <TransactionList
                expenses={expenses.slice(0, 8)}
                onEdit={(exp) => {
                  setEditingExpense(exp);
                  setIsExpenseModalOpen(true);
                }}
                onDelete={handleDeleteExpense}
                onOpenNewExpense={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Ledger & Filter Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Expenses & Detailed Ledger
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Manage, filter, search, and export all recorded transactions in Indian Rupees (₹)
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>

            <TransactionList
              expenses={expenses}
              onEdit={(exp) => {
                setEditingExpense(exp);
                setIsExpenseModalOpen(true);
              }}
              onDelete={handleDeleteExpense}
              onOpenNewExpense={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
            />
          </div>
        )}

        {/* Tab 3: Visualizations */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <ChartsView
              analytics={analytics}
              darkMode={darkMode}
              onSelectCategory={(cat) => {
                setActiveTab('transactions');
              }}
            />
          </div>
        )}

        {/* Tab 4: GitHub Version-Control Sync Engine */}
        {activeTab === 'github' && (
          <div className="space-y-6">
            <GitHubSettingsModal
              config={gitHubConfig}
              onUpdateConfig={handleUpdateGitHubConfig}
              syncState={syncState}
              onVerify={handleVerifyGitHub}
              onPushToGitHub={handlePushToGitHub}
              onPullFromGitHub={handlePullFromGitHub}
              expensesCount={expenses.length}
            />
          </div>
        )}

        {/* Tab 5: Local Python Backend Code & Setup */}
        {activeTab === 'python' && (
          <div className="space-y-6">
            <PythonExportModal />
          </div>
        )}
      </main>

      {/* Expense Add/Edit Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
      />

      {/* Clean Minimalist Footer */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 py-6 bg-white dark:bg-neutral-950 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-neutral-100">Kuber</span>
            <span aria-hidden="true">·</span>
            <span>Minimalist GitHub-Synced Expense Tracker</span>
            <span aria-hidden="true">·</span>
            <span>Amounts in ₹ (INR)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('python')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Python Server Code
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              GitHub Sync Settings
            </button>
            <button
              onClick={handleExportCSV}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Export CSV
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

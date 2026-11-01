import React from 'react';
import { Plus, Sun, Moon, GitBranch, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'transactions' | 'charts' | 'github' | 'python';
  setActiveTab: (tab: 'overview' | 'transactions' | 'charts' | 'github' | 'python') => void;
  onOpenNewExpense: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  gitHubConnected: boolean;
  autoSyncEnabled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewExpense,
  darkMode,
  setDarkMode,
  gitHubConnected,
  autoSyncEnabled,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm tracking-tight shadow-sm transition-transform group-hover:scale-105">
              ₹
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
              Kuber
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 concise single-line navigation links/tabs */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            Expenses & Ledger
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            Visualizations
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'github'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Sync</span>
            {gitHubConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connected" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'python'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Backend</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action button + theme toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenNewExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar">
        {(['overview', 'transactions', 'charts', 'github', 'python'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap capitalize ${
              activeTab === tab
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {tab === 'github' ? 'GitHub Sync' : tab === 'python' ? 'Python' : tab}
          </button>
        ))}
      </div>
    </header>
  );
};

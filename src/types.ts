export type Category =
  | 'Food & Dining'
  | 'Transportation'
  | 'Utilities & Bills'
  | 'Entertainment'
  | 'Investments & Savings'
  | 'Shopping'
  | 'Health & Wellness'
  | 'Education & Learning'
  | 'Travel & Lodging'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number; // in INR (₹)
  category: Category;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface GitHubConfig {
  pat: string;
  owner: string;
  repo: string;
  branch: string;
  path: string; // e.g. "data/expenses.json" or "expenses.json"
  format: 'json' | 'csv';
  autoSync: boolean;
}

export interface GitHubSyncState {
  status: 'idle' | 'testing' | 'syncing' | 'pulling' | 'success' | 'error';
  lastSyncedAt?: string;
  lastCommitSha?: string;
  lastCommitUrl?: string;
  fileSha?: string; // stored SHA from GitHub for contents update
  errorMessage?: string;
}

export interface SpendingAnalytics {
  total: number;
  monthlyTotal: number;
  lastMonthTotal: number;
  monthlyChangePercent: number;
  dailyAverage: number;
  topCategory: {
    category: Category;
    amount: number;
    percentage: number;
  } | null;
  categoryBreakdown: {
    category: Category;
    amount: number;
    percentage: number;
    count: number;
  }[];
  monthlyTrends: {
    month: string; // e.g. "Oct 2026"
    amount: number;
    count: number;
  }[];
}

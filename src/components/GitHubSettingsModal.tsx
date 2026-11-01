import React, { useState } from 'react';
import { GitHubConfig, GitHubSyncState, Expense } from '../types';
import {
  GitBranch,
  Key,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  DownloadCloud,
  UploadCloud,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

interface GitHubSettingsModalProps {
  config: GitHubConfig;
  onUpdateConfig: (newConfig: GitHubConfig) => void;
  syncState: GitHubSyncState;
  onVerify: () => Promise<void>;
  onPushToGitHub: () => Promise<void>;
  onPullFromGitHub: () => Promise<void>;
  expensesCount: number;
}

export const GitHubSettingsModal: React.FC<GitHubSettingsModalProps> = ({
  config,
  onUpdateConfig,
  syncState,
  onVerify,
  onPushToGitHub,
  onPullFromGitHub,
  expensesCount,
}) => {
  const [showToken, setShowToken] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  const handleChange = (field: keyof GitHubConfig, value: any) => {
    onUpdateConfig({
      ...config,
      [field]: value,
    });
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner / Explainer */}
      <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                GitHub Cloud Version Control & Sync Engine
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Back up and version-control your expenses directly to your private or public GitHub repository.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${
                config.pat && config.owner && config.repo
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  config.pat && config.owner && config.repo ? 'bg-emerald-500' : 'bg-neutral-400'
                }`}
              />
              {config.pat && config.owner && config.repo ? 'Configured' : 'Setup Required'}
            </span>
          </div>
        </div>

        {/* Sync Actions Bar */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onPushToGitHub}
              disabled={syncState.status === 'syncing' || !config.pat || !config.owner || !config.repo}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {syncState.status === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>Push {expensesCount} Records to GitHub</span>
            </button>

            <button
              onClick={onPullFromGitHub}
              disabled={syncState.status === 'pulling' || !config.pat || !config.owner || !config.repo}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {syncState.status === 'pulling' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <DownloadCloud className="w-3.5 h-3.5" />
              )}
              <span>Pull from Repository</span>
            </button>

            <button
              onClick={onVerify}
              disabled={syncState.status === 'testing' || !config.pat}
              className="px-3.5 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {syncState.status === 'testing' ? 'Verifying...' : 'Test Connection'}
            </button>
          </div>

          {/* Auto Sync Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => handleChange('autoSync', e.target.checked)}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Auto-commit on expense changes
            </span>
          </label>
        </div>

        {/* Sync Status / Messages */}
        {syncState.errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{syncState.errorMessage}</span>
          </div>
        )}

        {syncState.lastCommitSha && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Synced successfully! Commit:{' '}
                <button
                  onClick={() => handleCopySha(syncState.lastCommitSha!)}
                  className="font-mono font-semibold underline hover:text-emerald-950 dark:hover:text-white cursor-pointer"
                >
                  {syncState.lastCommitSha} {copiedSha && '(Copied!)'}
                </button>
              </span>
            </div>

            {syncState.lastCommitUrl && (
              <a
                href={syncState.lastCommitUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold hover:underline"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* GitHub Configuration Form */}
      <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-5">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-neutral-500" />
          <span>Repository & Authentication Settings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub Personal Access Token (PAT) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                GitHub Personal Access Token (PAT)
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Kuber%20Expense%20Tracker"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <span>Generate token with &lsquo;repo&rsquo; scope</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.pat}
                onChange={(e) => handleChange('pat', e.target.value)}
                className="w-full pr-16 pl-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer font-medium"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Token is kept securely in your local browser sandbox and never shared.</span>
            </p>
          </div>

          {/* Owner & Repo */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Repository Owner (Username / Org)
            </label>
            <input
              type="text"
              placeholder="e.g. octocat"
              value={config.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Repository Name
            </label>
            <input
              type="text"
              placeholder="e.g. my-expenses"
              value={config.repo}
              onChange={(e) => handleChange('repo', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Branch & Path */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Branch Name
            </label>
            <input
              type="text"
              placeholder="main"
              value={config.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Target File Path in Repo
            </label>
            <input
              type="text"
              placeholder="expenses.json or data/expenses.csv"
              value={config.path}
              onChange={(e) => handleChange('path', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Storage Format */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Cloud Storage Format
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => handleChange('format', 'json')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  config.format === 'json'
                    ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <FileCode className="w-4 h-4 text-neutral-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    JSON Array
                  </div>
                  <div className="text-xs text-neutral-500">
                    Standard structured format with metadata
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChange('format', 'csv')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  config.format === 'csv'
                    ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-neutral-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    CSV Table
                  </div>
                  <div className="text-xs text-neutral-500">
                    Spreadsheet-ready rows and headers
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* API documentation snippet */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            <strong>How it works:</strong> Kuber connects directly to the GitHub REST API endpoint:
            <code className="mx-1 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200 text-xs">
              PUT /repos/&#123;owner&#125;/&#123;repo&#125;/contents/&#123;path&#125;
            </code>
            Every sync creates an immutable Git commit with commit hash verification, preventing merge conflicts while preserving full historical version control.
          </p>
        </div>
      </div>
    </div>
  );
};

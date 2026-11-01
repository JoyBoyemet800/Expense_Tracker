import { Expense, GitHubConfig } from '../types';

/**
 * UTF-8 safe base64 encoding
 */
function utf8ToBase64(str: string): string {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(_match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

/**
 * UTF-8 safe base64 decoding
 */
function base64ToUtf8(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(window.atob(str), function (c: string) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

/**
 * Convert expenses array to CSV string
 */
export function expensesToCSV(expenses: Expense[]): string {
  const headers = ['id', 'date', 'title', 'amount', 'category', 'notes', 'createdAt', 'updatedAt'];
  const rows = expenses.map((e) => {
    return [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      `"${e.createdAt}"`,
      `"${e.updatedAt}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Parse CSV string to expenses array
 */
export function csvToExpenses(csvText: string): Expense[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse CSV line handling quotes
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const expenses: Expense[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    if (row.title && row.amount) {
      expenses.push({
        id: row.id || `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: row.title,
        amount: parseFloat(row.amount) || 0,
        category: (row.category as any) || 'Other',
        date: row.date || new Date().toISOString().split('T')[0],
        notes: row.notes || '',
        createdAt: row.createdat || new Date().toISOString(),
        updatedAt: row.updatedat || new Date().toISOString(),
      });
    }
  }

  return expenses;
}

/**
 * Verify GitHub Personal Access Token and repo access
 */
export async function verifyGitHubRepo(config: Pick<GitHubConfig, 'pat' | 'owner' | 'repo'>): Promise<{
  valid: boolean;
  repoName?: string;
  defaultBranch?: string;
  isPrivate?: boolean;
  error?: string;
}> {
  try {
    const cleanToken = config.pat.trim();
    const cleanOwner = config.owner.trim();
    const cleanRepo = config.repo.trim();

    if (!cleanToken) return { valid: false, error: 'Personal Access Token (PAT) is required' };
    if (!cleanOwner || !cleanRepo) return { valid: false, error: 'Repository owner and name are required' };

    const res = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 401) {
      return { valid: false, error: 'Invalid GitHub token. Please verify PAT permissions (repo scope).' };
    }
    if (res.status === 404) {
      return { valid: false, error: `Repository "${cleanOwner}/${cleanRepo}" not found or token lacks access.` };
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { valid: false, error: data.message || `GitHub returned status ${res.status}` };
    }

    const data = await res.json();
    return {
      valid: true,
      repoName: data.full_name,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Network error connecting to GitHub' };
  }
}

/**
 * Fetch current expenses file from GitHub repository
 */
export async function fetchFileFromGitHub(
  config: GitHubConfig
): Promise<{ success: boolean; expenses?: Expense[]; sha?: string; error?: string }> {
  try {
    const cleanPath = config.path.replace(/^\//, '');
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${cleanPath}?ref=${config.branch || 'main'}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.pat.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 404) {
      // File doesn't exist yet on GitHub (will be created on first push)
      return { success: true, expenses: [], sha: undefined };
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || `Failed to fetch file (HTTP ${res.status})` };
    }

    const data = await res.json();
    const contentUtf8 = base64ToUtf8(data.content.replace(/\s/g, ''));

    let parsedExpenses: Expense[] = [];
    if (config.format === 'csv' || cleanPath.endsWith('.csv')) {
      parsedExpenses = csvToExpenses(contentUtf8);
    } else {
      const parsed = JSON.parse(contentUtf8);
      parsedExpenses = Array.isArray(parsed) ? parsed : parsed.expenses || [];
    }

    return {
      success: true,
      expenses: parsedExpenses,
      sha: data.sha,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse file from GitHub' };
  }
}

/**
 * Commit & push expenses to GitHub repository
 */
export async function pushExpensesToGitHub(
  config: GitHubConfig,
  expenses: Expense[],
  options?: { customMessage?: string; knownSha?: string }
): Promise<{ success: boolean; commitSha?: string; commitUrl?: string; newFileSha?: string; error?: string }> {
  try {
    const cleanPath = config.path.replace(/^\//, '');
    let existingSha = options?.knownSha;

    // If sha is not passed, fetch existing file to get current sha (prevents conflict)
    if (!existingSha) {
      const getRes = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${cleanPath}?ref=${config.branch || 'main'}`,
        {
          headers: {
            Authorization: `Bearer ${config.pat.trim()}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (getRes.ok) {
        const fileData = await getRes.json();
        existingSha = fileData.sha;
      }
    }

    // Format content based on format
    let rawContent = '';
    if (config.format === 'csv' || cleanPath.endsWith('.csv')) {
      rawContent = expensesToCSV(expenses);
    } else {
      rawContent = JSON.stringify(expenses, null, 2);
    }

    const base64Content = utf8ToBase64(rawContent);

    const commitMessage =
      options?.customMessage ||
      `chore(kuber): sync ${expenses.length} expenses [${new Date().toISOString().replace('T', ' ').slice(0, 16)}]`;

    const putBody: Record<string, any> = {
      message: commitMessage,
      content: base64Content,
      branch: config.branch || 'main',
    };

    if (existingSha) {
      putBody.sha = existingSha;
    }

    const putRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${cleanPath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.pat.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      return {
        success: false,
        error: errData.message || `GitHub error ${putRes.status}: Unable to commit file.`,
      };
    }

    const resData = await putRes.json();
    return {
      success: true,
      commitSha: resData.commit?.sha?.substring(0, 7) || 'latest',
      commitUrl: resData.commit?.html_url || `https://github.com/${config.owner}/${config.repo}/commits/${config.branch || 'main'}`,
      newFileSha: resData.content?.sha,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error pushing to GitHub' };
  }
}

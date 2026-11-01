import { Expense, SpendingAnalytics, Category } from '../types';

export function calculateAnalytics(expenses: Expense[]): SpendingAnalytics {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let total = 0;
  let monthlyTotal = 0;
  let lastMonthTotal = 0;

  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const categoryMap = new Map<Category, { amount: number; count: number }>();
  const monthlyTrendsMap = new Map<string, { amount: number; count: number }>();

  // Pre-populate last 6 months in trend map so chart always has 6 chronological points
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyTrendsMap.set(key, { amount: 0, count: 0 });
  }

  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    total += amt;

    const expDateStr = exp.date; // YYYY-MM-DD
    const expMonthKey = expDateStr.substring(0, 7);

    if (expMonthKey === currentMonthKey) {
      monthlyTotal += amt;
    } else if (expMonthKey === lastMonthKey) {
      lastMonthTotal += amt;
    }

    // Category tracking for current month (or all-time if month has zero)
    const existingCat = categoryMap.get(exp.category) || { amount: 0, count: 0 };
    categoryMap.set(exp.category, {
      amount: existingCat.amount + amt,
      count: existingCat.count + 1,
    });

    // Monthly trend
    if (monthlyTrendsMap.has(expMonthKey)) {
      const trend = monthlyTrendsMap.get(expMonthKey)!;
      trend.amount += amt;
      trend.count += 1;
    }
  }

  // Monthly percentage change
  let monthlyChangePercent = 0;
  if (lastMonthTotal > 0) {
    monthlyChangePercent = Math.round(((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100);
  } else if (monthlyTotal > 0) {
    monthlyChangePercent = 100;
  }

  // Daily average
  const daysPassed = Math.max(1, now.getDate());
  const dailyAverage = Math.round(monthlyTotal / daysPassed);

  // Category breakdown list
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      amount: stats.amount,
      count: stats.count,
      percentage: total > 0 ? Math.round((stats.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  // Format monthly trends for charts
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrends = Array.from(monthlyTrendsMap.entries()).map(([key, data]) => {
    const [year, month] = key.split('-');
    const monthName = monthNames[parseInt(month, 10) - 1];
    return {
      month: `${monthName} '${year.slice(-2)}`,
      amount: data.amount,
      count: data.count,
    };
  });

  return {
    total,
    monthlyTotal,
    lastMonthTotal,
    monthlyChangePercent,
    dailyAverage,
    topCategory,
    categoryBreakdown,
    monthlyTrends,
  };
}

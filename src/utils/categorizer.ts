import { Category } from '../types';

interface Rule {
  category: Category;
  keywords: string[];
}

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; dot: string; border: string }> = {
  'Food & Dining': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-900/50',
  },
  'Transportation': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-900/50',
  },
  'Utilities & Bills': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-900/50',
  },
  'Entertainment': {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
    border: 'border-purple-200 dark:border-purple-900/50',
  },
  'Investments & Savings': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-400',
    dot: 'bg-indigo-500',
    border: 'border-indigo-200 dark:border-indigo-900/50',
  },
  'Shopping': {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
    border: 'border-rose-200 dark:border-rose-900/50',
  },
  'Health & Wellness': {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-400',
    dot: 'bg-teal-500',
    border: 'border-teal-200 dark:border-teal-900/50',
  },
  'Education & Learning': {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
    border: 'border-sky-200 dark:border-sky-900/50',
  },
  'Travel & Lodging': {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
    border: 'border-orange-200 dark:border-orange-900/50',
  },
  'Other': {
    bg: 'bg-neutral-100 dark:bg-neutral-800/40',
    text: 'text-neutral-700 dark:text-neutral-400',
    dot: 'bg-neutral-500',
    border: 'border-neutral-200 dark:border-neutral-800',
  },
};

export const CATEGORIES: Category[] = [
  'Food & Dining',
  'Transportation',
  'Utilities & Bills',
  'Entertainment',
  'Investments & Savings',
  'Shopping',
  'Health & Wellness',
  'Education & Learning',
  'Travel & Lodging',
  'Other',
];

const RULES: Rule[] = [
  {
    category: 'Food & Dining',
    keywords: [
      'swiggy', 'zomato', 'blinkit', 'zepto', 'dunzo', 'instamart', 'bigbasket',
      'mcdonalds', 'kfc', 'dominos', 'pizza', 'burger', 'subway', 'starbucks',
      'cafe', 'coffee', 'tea', 'chai', 'restaurant', 'dining', 'lunch', 'dinner',
      'breakfast', 'groceries', 'grocery', 'haldirams', 'sweet', 'bakery', 'barbeque',
      'supermarket', 'd-mart', 'dmart', 'nature basket', 'food'
    ],
  },
  {
    category: 'Transportation',
    keywords: [
      'uber', 'ola', 'rapido', 'blusmart', 'blu-smart', 'metro', 'irctc', 'train',
      'railway', 'petrol', 'diesel', 'fuel', 'shell', 'hpcl', 'iocl', 'bpcl',
      'fastag', 'toll', 'parking', 'cab', 'auto', 'rickshaw', 'bus', 'chalo',
      'flight', 'redbus', 'scooty', 'bike'
    ],
  },
  {
    category: 'Utilities & Bills',
    keywords: [
      'electricity', 'bescom', 'mseb', 'tata power', 'adani electricity', 'water bill',
      'gas bill', 'indane', 'hp gas', 'bharat gas', 'wifi', 'broadband', 'act fibernet',
      'airtel', 'jio', 'vi', 'vodafone', 'mobile recharge', 'maintenance', 'rent',
      'house rent', 'flat', 'maid', 'cook', 'newspaper', 'utility', 'bills'
    ],
  },
  {
    category: 'Entertainment',
    keywords: [
      'netflix', 'spotify', 'hotstar', 'disney', 'prime video', 'youtube',
      'bookmyshow', 'pvr', 'inox', 'cinepolis', 'movie', 'cinema', 'theatre',
      'steam', 'playstation', 'xbox', 'gaming', 'concert', 'event', 'party', 'audible'
    ],
  },
  {
    category: 'Investments & Savings',
    keywords: [
      'zerodha', 'groww', 'angelone', 'angel one', 'upstox', 'coin', 'kite',
      'mutual fund', 'sip', 'indmoney', 'kuvera', 'ppfas', 'index fund', 'etf',
      'shares', 'stocks', 'equity', 'nifty', 'fixed deposit', 'recurring deposit',
      'fd', 'rd', 'ppf', 'nps', 'gold', 'sovereign gold', 'crypto', 'coinbase'
    ],
  },
  {
    category: 'Shopping',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'tata cliq', 'nykaa',
      'purplle', 'zara', 'h&m', 'uniqlo', 'westside', 'lifestyle', 'ikea',
      'croma', 'reliance digital', 'decathlon', 'clothes', 'shoes', 'electronics',
      'gadget', 'furniture', 'shopping'
    ],
  },
  {
    category: 'Health & Wellness',
    keywords: [
      'apollo', 'pharmeasy', '1mg', 'tata 1mg', 'netmeds', 'medplus', 'doctor',
      'hospital', 'clinic', 'consultation', 'medicine', 'prescription', 'pharmacy',
      'dentist', 'dental', 'gym', 'cult.fit', 'cult', 'fitness', 'protein',
      'yoga', 'blood test', 'lab', 'diagnostics', 'therapy'
    ],
  },
  {
    category: 'Education & Learning',
    keywords: [
      'udemy', 'coursera', 'edx', 'books', 'book', 'kindle', 'audible',
      'tuition', 'coaching', 'school fee', 'college fee', 'course', 'certification',
      'subscription', 'medium', 'substack', 'tutorial'
    ],
  },
  {
    category: 'Travel & Lodging',
    keywords: [
      'makemytrip', 'mmt', 'goibibo', 'easemytrip', 'cleartrip', 'air india',
      'indigo', 'vistara', 'akasa', 'spicejet', 'hotel', 'airbnb', 'oyo',
      'resort', 'homestay', 'vacation', 'luggage', 'visa', 'trip'
    ],
  },
];

export interface AutoSuggestResult {
  category: Category;
  keywordMatched: string;
  confidence: number;
}

export function autoSuggestCategory(title: string): AutoSuggestResult | null {
  if (!title || title.trim().length < 2) return null;

  const normalized = title.toLowerCase().trim();

  // 1. Direct word or substring match
  for (const rule of RULES) {
    for (const keyword of rule.keywords) {
      // Regex check for word boundary or direct substring
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalized)) {
        return {
          category: rule.category,
          keywordMatched: keyword,
          confidence: 0.95,
        };
      }
    }
  }

  // 2. Loose substring match if word boundary didn't hit
  for (const rule of RULES) {
    for (const keyword of rule.keywords) {
      if (keyword.length >= 4 && normalized.includes(keyword)) {
        return {
          category: rule.category,
          keywordMatched: keyword,
          confidence: 0.8,
        };
      }
    }
  }

  return null;
}

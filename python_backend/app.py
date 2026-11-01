"""
Kuber Expense Tracker - Python Flask Backend
Provides RESTful APIs for expense management, smart categorization,
analytical summaries in Indian Rupees (₹), and direct GitHub version-control sync.
"""

import os
import json
import base64
import uuid
from datetime import datetime
from typing import Dict, Any, List
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests

app = Flask(__name__, static_folder='../dist', static_url_path='/')
CORS(app)  # Enable Cross-Origin Resource Sharing for local frontend dev

DATA_FILE = os.path.join(os.path.dirname(__file__), 'expenses.json')

# ---------------------------------------------------------
# Rule-based Smart Categorizer
# ---------------------------------------------------------
RULES = {
    'Food & Dining': [
        'swiggy', 'zomato', 'blinkit', 'zepto', 'dunzo', 'instamart', 'bigbasket',
        'mcdonalds', 'kfc', 'dominos', 'pizza', 'burger', 'subway', 'starbucks',
        'cafe', 'coffee', 'tea', 'chai', 'restaurant', 'dining', 'lunch', 'dinner',
        'breakfast', 'groceries', 'grocery', 'haldirams', 'bakery', 'food'
    ],
    'Transportation': [
        'uber', 'ola', 'rapido', 'blusmart', 'blu-smart', 'metro', 'irctc', 'train',
        'railway', 'petrol', 'diesel', 'fuel', 'shell', 'hpcl', 'iocl', 'bpcl',
        'fastag', 'toll', 'parking', 'cab', 'auto', 'rickshaw', 'bus', 'flight'
    ],
    'Utilities & Bills': [
        'electricity', 'bescom', 'mseb', 'tata power', 'water bill', 'gas bill',
        'indane', 'hp gas', 'bharat gas', 'wifi', 'broadband', 'airtel', 'jio', 'vi',
        'mobile recharge', 'maintenance', 'rent', 'maid', 'cook'
    ],
    'Entertainment': [
        'netflix', 'spotify', 'hotstar', 'disney', 'prime video', 'youtube',
        'bookmyshow', 'pvr', 'inox', 'movie', 'cinema', 'theatre', 'steam', 'playstation'
    ],
    'Investments & Savings': [
        'zerodha', 'groww', 'angelone', 'upstox', 'coin', 'kite', 'mutual fund',
        'sip', 'indmoney', 'ppfas', 'index fund', 'shares', 'stocks', 'equity',
        'fixed deposit', 'fd', 'rd', 'gold', 'crypto'
    ],
    'Shopping': [
        'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'tata cliq', 'nykaa',
        'zara', 'h&m', 'uniqlo', 'ikea', 'croma', 'reliance digital', 'shopping'
    ],
    'Health & Wellness': [
        'apollo', 'pharmeasy', '1mg', 'netmeds', 'doctor', 'hospital', 'clinic',
        'medicine', 'dentist', 'gym', 'cult.fit', 'fitness', 'protein', 'yoga'
    ],
    'Education & Learning': [
        'udemy', 'coursera', 'books', 'kindle', 'tuition', 'coaching', 'school fee',
        'college fee', 'course', 'certification'
    ],
    'Travel & Lodging': [
        'makemytrip', 'mmt', 'goibibo', 'easemytrip', 'air india', 'indigo',
        'vistara', 'hotel', 'airbnb', 'oyo', 'resort', 'vacation'
    ]
}

def auto_suggest_category(title: str) -> str:
    """Detects category based on keyword heuristic."""
    if not title:
        return 'Other'
    lower_title = title.lower()
    for category, keywords in RULES.items():
        for kw in keywords:
            if kw in lower_title:
                return category
    return 'Other'

# ---------------------------------------------------------
# Data Persistence (JSON Storage)
# ---------------------------------------------------------
def load_expenses() -> List[Dict[str, Any]]:
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def save_expenses(expenses: List[Dict[str, Any]]) -> None:
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(expenses, f, indent=2, ensure_ascii=False)

# Seed sample data if empty
if not os.path.exists(DATA_FILE):
    seed_data = [
        {
            "id": "exp_01",
            "title": "Swiggy Gourmet Dinner",
            "amount": 850,
            "category": "Food & Dining",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "notes": "Team dinner celebration",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        },
        {
            "id": "exp_02",
            "title": "Uber to Indiranagar Metro",
            "amount": 340,
            "category": "Transportation",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "notes": "Morning commute",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        },
        {
            "id": "exp_03",
            "title": "Zerodha Coin Monthly SIP",
            "amount": 15000,
            "category": "Investments & Savings",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "notes": "Index fund automated investment",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
    ]
    save_expenses(seed_data)

# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'kuber-expense-tracker-api',
        'currency': 'INR (₹)',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/categorize', methods=['POST'])
def categorize():
    data = request.get_json() or {}
    title = data.get('title', '')
    suggested = auto_suggest_category(title)
    return jsonify({
        'title': title,
        'suggestedCategory': suggested
    })

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    expenses = load_expenses()
    search = request.args.get('search', '').lower()
    category = request.args.get('category')
    sort_by = request.args.get('sort', 'date_desc')

    filtered = expenses
    if search:
        filtered = [
            e for e in filtered
            if search in e.get('title', '').lower() or search in e.get('notes', '').lower()
        ]
    if category and category != 'All':
        filtered = [e for e in filtered if e.get('category') == category]

    if sort_by == 'amount_desc':
        filtered.sort(key=lambda x: x.get('amount', 0), reverse=True)
    elif sort_by == 'amount_asc':
        filtered.sort(key=lambda x: x.get('amount', 0))
    elif sort_by == 'date_asc':
        filtered.sort(key=lambda x: x.get('date', ''))
    else:  # date_desc
        filtered.sort(key=lambda x: x.get('date', ''), reverse=True)

    return jsonify(filtered)

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    amount = float(data.get('amount', 0))
    category = data.get('category') or auto_suggest_category(title)
    date_str = data.get('date') or datetime.now().strftime("%Y-%m-%d")
    notes = data.get('notes', '')

    if not title:
        return jsonify({'error': 'Title is required'}), 400
    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400

    new_item = {
        'id': f"exp_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:6]}",
        'title': title,
        'amount': amount,
        'category': category,
        'date': date_str,
        'notes': notes,
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }

    expenses = load_expenses()
    expenses.insert(0, new_item)
    save_expenses(expenses)

    return jsonify(new_item), 201

@app.route('/api/expenses/<expense_id>', methods=['PUT'])
def update_expense(expense_id):
    data = request.get_json() or {}
    expenses = load_expenses()
    item = next((e for e in expenses if e['id'] == expense_id), None)
    if not item:
        return jsonify({'error': 'Expense not found'}), 404

    item['title'] = data.get('title', item['title']).strip()
    item['amount'] = float(data.get('amount', item['amount']))
    item['category'] = data.get('category', item['category'])
    item['date'] = data.get('date', item['date'])
    item['notes'] = data.get('notes', item.get('notes', ''))
    item['updatedAt'] = datetime.now().isoformat()

    save_expenses(expenses)
    return jsonify(item)

@app.route('/api/expenses/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    expenses = load_expenses()
    remaining = [e for e in expenses if e['id'] != expense_id]
    if len(remaining) == len(expenses):
        return jsonify({'error': 'Expense not found'}), 404
    save_expenses(remaining)
    return jsonify({'success': True, 'deletedId': expense_id})

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    expenses = load_expenses()
    now = datetime.now()
    current_month_prefix = now.strftime("%Y-%m")

    total = sum(e.get('amount', 0) for e in expenses)
    monthly_expenses = [e for e in expenses if e.get('date', '').startswith(current_month_prefix)]
    monthly_total = sum(e.get('amount', 0) for e in monthly_expenses)
    daily_avg = round(monthly_total / max(1, now.day), 2)

    category_sums: Dict[str, float] = {}
    for e in expenses:
        cat = e.get('category', 'Other')
        category_sums[cat] = category_sums.get(cat, 0) + e.get('amount', 0)

    breakdown = [
        {'category': cat, 'amount': amt, 'percentage': round((amt / total * 100), 1) if total > 0 else 0}
        for cat, amt in sorted(category_sums.items(), key=lambda x: x[1], reverse=True)
    ]

    return jsonify({
        'total': total,
        'monthlyTotal': monthly_total,
        'dailyAverage': daily_avg,
        'topCategory': breakdown[0] if breakdown else None,
        'categoryBreakdown': breakdown
    })

# ---------------------------------------------------------
# GitHub Sync Proxy Endpoints
# ---------------------------------------------------------
@app.route('/api/github/verify', methods=['POST'])
def verify_github():
    data = request.get_json() or {}
    pat = data.get('pat', '').strip()
    owner = data.get('owner', '').strip()
    repo = data.get('repo', '').strip()

    if not pat or not owner or not repo:
        return jsonify({'valid': False, 'error': 'Missing pat, owner, or repo'}), 400

    resp = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}",
        headers={'Authorization': f"Bearer {pat}", 'Accept': 'application/vnd.github.v3+json'}
    )
    if resp.status_code == 200:
        repo_data = resp.json()
        return jsonify({
            'valid': True,
            'repoName': repo_data.get('full_name'),
            'defaultBranch': repo_data.get('default_branch'),
            'isPrivate': repo_data.get('private')
        })
    return jsonify({
        'valid': False,
        'status': resp.status_code,
        'error': resp.json().get('message', 'Failed to authenticate with GitHub')
    }), resp.status_code

@app.route('/api/github/sync', methods=['POST'])
def sync_github():
    data = request.get_json() or {}
    pat = data.get('pat', '').strip()
    owner = data.get('owner', '').strip()
    repo = data.get('repo', '').strip()
    branch = data.get('branch', 'main').strip()
    file_path = data.get('path', 'expenses.json').strip().lstrip('/')
    format_type = data.get('format', 'json')

    expenses = load_expenses()

    # Format content
    if format_type == 'csv' or file_path.endswith('.csv'):
        import csv
        import io
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=['id', 'date', 'title', 'amount', 'category', 'notes', 'createdAt', 'updatedAt'])
        writer.writeheader()
        for e in expenses:
            writer.writerow(e)
        content_str = output.getvalue()
    else:
        content_str = json.dumps(expenses, indent=2, ensure_ascii=False)

    encoded_content = base64.b64encode(content_str.encode('utf-8')).decode('utf-8')

    headers = {
        'Authorization': f"Bearer {pat}",
        'Accept': 'application/vnd.github.v3+json'
    }

    # Check for existing file SHA to avoid 409 Conflict
    existing_sha = None
    check_resp = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}?ref={branch}",
        headers=headers
    )
    if check_resp.status_code == 200:
        existing_sha = check_resp.json().get('sha')

    put_body = {
        'message': f"chore(kuber): sync {len(expenses)} expenses via Python backend [{datetime.now().strftime('%Y-%m-%d %H:%M')}]",
        'content': encoded_content,
        'branch': branch
    }
    if existing_sha:
        put_body['sha'] = existing_sha

    put_resp = requests.put(
        f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}",
        headers=headers,
        json=put_body
    )

    if put_resp.status_code in (200, 201):
        resp_data = put_resp.json()
        return jsonify({
            'success': True,
            'commitSha': resp_data.get('commit', {}).get('sha', '')[:7],
            'commitUrl': resp_data.get('commit', {}).get('html_url'),
            'fileSha': resp_data.get('content', {}).get('sha')
        })

    return jsonify({
        'success': False,
        'error': put_resp.json().get('message', 'Failed to push to GitHub')
    }), put_resp.status_code


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Kuber Flask Backend running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)

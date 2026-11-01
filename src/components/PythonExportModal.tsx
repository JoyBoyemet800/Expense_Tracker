import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Download, ExternalLink } from 'lucide-react';

export const PythonExportModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'flask' | 'fastapi' | 'requirements' | 'instructions'>('instructions');
  const [copied, setCopied] = useState(false);

  const flaskCode = `"""
Kuber Expense Tracker - Python Flask Backend
Provides RESTful APIs for expense management, smart categorization,
and direct GitHub version-control synchronization.
"""

import os
import json
import base64
import uuid
from datetime import datetime
from typing import Dict, Any, List
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

DATA_FILE = 'expenses.json'

# Rule-based Smart Categorizer
RULES = {
    'Food & Dining': ['swiggy', 'zomato', 'blinkit', 'zepto', 'mcdonalds', 'dominos', 'coffee', 'groceries', 'restaurant'],
    'Transportation': ['uber', 'ola', 'rapido', 'metro', 'irctc', 'petrol', 'diesel', 'fuel', 'fastag', 'toll', 'flight'],
    'Utilities & Bills': ['electricity', 'bescom', 'mseb', 'water', 'gas', 'wifi', 'broadband', 'airtel', 'jio', 'rent'],
    'Entertainment': ['netflix', 'spotify', 'hotstar', 'prime', 'youtube', 'bookmyshow', 'pvr', 'movie', 'steam'],
    'Investments & Savings': ['zerodha', 'groww', 'angelone', 'sip', 'mutual fund', 'index fund', 'shares', 'gold'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'zara', 'croma', 'ikea'],
    'Health & Wellness': ['apollo', 'pharmeasy', '1mg', 'doctor', 'hospital', 'medicine', 'gym', 'cult.fit'],
    'Education & Learning': ['udemy', 'coursera', 'books', 'kindle', 'tuition', 'course'],
    'Travel & Lodging': ['makemytrip', 'mmt', 'airbnb', 'hotel', 'indigo', 'vistara']
}

def auto_suggest_category(title: str) -> str:
    if not title:
        return 'Other'
    lower = title.lower()
    for cat, words in RULES.items():
        if any(w in lower for w in words):
            return cat
    return 'Other'

def load_expenses() -> List[Dict[str, Any]]:
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_expenses(expenses: List[Dict[str, Any]]) -> None:
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(expenses, f, indent=2, ensure_ascii=False)

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    return jsonify(load_expenses())

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    amount = float(data.get('amount', 0))
    category = data.get('category') or auto_suggest_category(title)
    
    item = {
        'id': f"exp_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:6]}",
        'title': title,
        'amount': amount,
        'category': category,
        'date': data.get('date', datetime.now().strftime("%Y-%m-%d")),
        'notes': data.get('notes', ''),
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    
    expenses = load_expenses()
    expenses.insert(0, item)
    save_expenses(expenses)
    return jsonify(item), 201

@app.route('/api/github/sync', methods=['POST'])
def sync_to_github():
    data = request.get_json() or {}
    pat = data.get('pat')
    owner = data.get('owner')
    repo = data.get('repo')
    path = data.get('path', 'expenses.json')
    branch = data.get('branch', 'main')

    expenses = load_expenses()
    content_str = json.dumps(expenses, indent=2, ensure_ascii=False)
    encoded = base64.b64encode(content_str.encode('utf-8')).decode('utf-8')

    headers = {
        'Authorization': f"Bearer {pat}",
        'Accept': 'application/vnd.github.v3+json'
    }

    # Fetch SHA if file exists
    existing_sha = None
    check = requests.get(f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}", headers=headers)
    if check.status_code == 200:
        existing_sha = check.json().get('sha')

    body = {
        'message': f"chore: sync {len(expenses)} expenses via Python Flask",
        'content': encoded,
        'branch': branch
    }
    if existing_sha:
        body['sha'] = existing_sha

    put = requests.put(f"https://api.github.com/repos/{owner}/{repo}/contents/{path}", headers=headers, json=body)
    return jsonify(put.json()), put.status_code

if __name__ == '__main__':
    app.run(port=5000, debug=True)
`;

  const fastapiCode = `"""
Kuber Expense Tracker - Python FastAPI Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json, os, uuid, base64, requests
from datetime import datetime

app = FastAPI(title="Kuber API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATA_FILE = "expenses.json"

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: Optional[str] = "Other"
    date: Optional[str] = None
    notes: Optional[str] = ""

def load_data():
    return json.load(open(DATA_FILE)) if os.path.exists(DATA_FILE) else []

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.get("/api/expenses")
def get_all():
    return load_data()

@app.post("/api/expenses")
def create(exp: ExpenseCreate):
    data = load_data()
    item = {
        "id": f"exp_{uuid.uuid4().hex[:8]}",
        "title": exp.title,
        "amount": exp.amount,
        "category": exp.category,
        "date": exp.date or datetime.now().strftime("%Y-%m-%d"),
        "notes": exp.notes,
        "createdAt": datetime.now().isoformat()
    }
    data.insert(0, item)
    save_data(data)
    return item

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=5000, reload=True)
`;

  const requirementsCode = `# Python Backend Dependencies
flask==3.0.2
flask-cors==4.0.0
requests==2.31.0
python-dotenv==1.0.1
fastapi==0.110.0
uvicorn[standard]==0.28.0
pydantic==2.6.4
`;

  const activeContent =
    selectedFile === 'flask'
      ? flaskCode
      : selectedFile === 'fastapi'
      ? fastapiCode
      : selectedFile === 'requirements'
      ? requirementsCode
      : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Standalone Python Backend Code & Local Setup
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Run the backend on your machine using Flask or FastAPI with local file storage & GitHub synchronization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setSelectedFile('instructions')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedFile === 'instructions'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Quickstart Guide
        </button>
        <button
          onClick={() => setSelectedFile('flask')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedFile === 'flask'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          app.py (Flask)
        </button>
        <button
          onClick={() => setSelectedFile('fastapi')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedFile === 'fastapi'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          fastapi_app.py (FastAPI)
        </button>
        <button
          onClick={() => setSelectedFile('requirements')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedFile === 'requirements'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          requirements.txt
        </button>
      </div>

      {/* Content */}
      {selectedFile === 'instructions' ? (
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              How to Run the Python Backend Locally
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              The project files are already located in the <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200">python_backend/</code> folder of this project. Follow these 3 simple steps to launch it on your local environment:
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                1. Set up a Python Virtual Environment
              </span>
              <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
{`cd python_backend
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\\Scripts\\activate`}
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                2. Install Dependencies
              </span>
              <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
{`pip install -r requirements.txt`}
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                3. Run Either Server
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Start the Flask server:
              </p>
              <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
{`python app.py`}
              </pre>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Or start with FastAPI (with live interactive Swagger docs at http://localhost:5000/docs):
              </p>
              <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
{`uvicorn fastapi_app:app --reload --port 5000`}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
              {selectedFile === 'flask' ? 'app.py' : selectedFile === 'fastapi' ? 'fastapi_app.py' : 'requirements.txt'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 rounded-md border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() =>
                  handleDownloadFile(
                    selectedFile === 'flask'
                      ? 'app.py'
                      : selectedFile === 'fastapi'
                      ? 'fastapi_app.py'
                      : 'requirements.txt',
                    activeContent
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <pre className="p-4 text-xs font-mono text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-950 overflow-x-auto max-h-[600px] leading-relaxed">
            {activeContent}
          </pre>
        </div>
      )}
    </div>
  );
};

"""
Kuber Expense Tracker - Python FastAPI Backend
High-performance asynchronous backend with Pydantic validation,
OpenAPI auto-documentation (/docs), and GitHub version control sync.
"""

import os
import json
import base64
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests

app = FastAPI(
    title="Kuber Expense Tracker API",
    description="Minimalist, smart expense tracker API with automated GitHub version control synchronization.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'expenses.json')

# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------
class ExpenseCreate(BaseModel):
    title: str = Field(..., example="Swiggy Delivery")
    amount: float = Field(..., gt=0, example=650.0)
    category: Optional[str] = Field(None, example="Food & Dining")
    date: Optional[str] = Field(None, example="2026-11-01")
    notes: Optional[str] = Field("", example="Dinner with friends")

class Expense(BaseModel):
    id: str
    title: str
    amount: float
    category: str
    date: str
    notes: Optional[str] = ""
    createdAt: str
    updatedAt: str

class GitHubVerifyRequest(BaseModel):
    pat: str
    owner: str
    repo: str

class GitHubSyncRequest(BaseModel):
    pat: str
    owner: str
    repo: str
    branch: Optional[str] = "main"
    path: Optional[str] = "expenses.json"
    format: Optional[str] = "json"

# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------
def load_db() -> List[dict]:
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def save_db(data: List[dict]):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def auto_detect_category(title: str) -> str:
    keywords = {
        'Food & Dining': ['swiggy', 'zomato', 'blinkit', 'zepto', 'mcdonalds', 'dominos', 'cafe', 'restaurant', 'groceries', 'coffee'],
        'Transportation': ['uber', 'ola', 'rapido', 'metro', 'petrol', 'diesel', 'fuel', 'fastag', 'toll', 'flight', 'irctc'],
        'Utilities & Bills': ['electricity', 'bescom', 'mseb', 'wifi', 'broadband', 'airtel', 'jio', 'rent', 'gas'],
        'Entertainment': ['netflix', 'spotify', 'hotstar', 'prime', 'movie', 'cinema', 'bookmyshow', 'gaming'],
        'Investments & Savings': ['zerodha', 'groww', 'angelone', 'sip', 'mutual fund', 'index fund', 'stocks', 'equity'],
        'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'zara', 'croma'],
        'Health & Wellness': ['apollo', 'pharmeasy', '1mg', 'doctor', 'clinic', 'medicine', 'cult', 'gym'],
        'Education & Learning': ['udemy', 'coursera', 'books', 'kindle', 'course', 'tuition'],
        'Travel & Lodging': ['makemytrip', 'mmt', 'airbnb', 'hotel', 'indigo', 'vistara']
    }
    low = title.lower()
    for cat, words in keywords.items():
        if any(w in low for w in words):
            return cat
    return 'Other'

# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "FastAPI", "currency": "INR (₹)"}

@app.get("/api/expenses", response_model=List[Expense])
def get_expenses(search: Optional[str] = None, category: Optional[str] = None):
    data = load_db()
    if search:
        s = search.lower()
        data = [e for e in data if s in e.get("title", "").lower() or s in e.get("notes", "").lower()]
    if category and category != "All":
        data = [e for e in data if e.get("category") == category]
    return sorted(data, key=lambda x: x.get("date", ""), reverse=True)

@app.post("/api/expenses", response_model=Expense, status_code=status.HTTP_201_CREATED)
def create_expense(expense: ExpenseCreate):
    data = load_db()
    cat = expense.category or auto_detect_category(expense.title)
    dt = expense.date or datetime.now().strftime("%Y-%m-%d")
    now_iso = datetime.now().isoformat()

    new_item = {
        "id": f"exp_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:6]}",
        "title": expense.title.strip(),
        "amount": expense.amount,
        "category": cat,
        "date": dt,
        "notes": expense.notes or "",
        "createdAt": now_iso,
        "updatedAt": now_iso
    }
    data.insert(0, new_item)
    save_db(data)
    return new_item

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: str):
    data = load_db()
    filtered = [e for e in data if e.get("id") != expense_id]
    if len(filtered) == len(data):
        raise HTTPException(status_code=404, detail="Expense not found")
    save_db(filtered)
    return {"success": True, "deletedId": expense_id}

@app.post("/api/github/sync")
def sync_to_github(req: GitHubSyncRequest):
    data = load_db()
    content_str = json.dumps(data, indent=2, ensure_ascii=False)
    encoded = base64.b64encode(content_str.encode("utf-8")).decode("utf-8")

    headers = {
        "Authorization": f"Bearer {req.pat.strip()}",
        "Accept": "application/vnd.github.v3+json"
    }

    # Fetch existing SHA
    existing_sha = None
    check = requests.get(
        f"https://api.github.com/repos/{req.owner}/{req.repo}/contents/{req.path}?ref={req.branch}",
        headers=headers
    )
    if check.status_code == 200:
        existing_sha = check.json().get("sha")

    body = {
        "message": f"chore: sync {len(data)} expenses [FastAPI]",
        "content": encoded,
        "branch": req.branch
    }
    if existing_sha:
        body["sha"] = existing_sha

    put = requests.put(
        f"https://api.github.com/repos/{req.owner}/{req.repo}/contents/{req.path}",
        headers=headers,
        json=body
    )

    if put.status_code in (200, 201):
        res = put.json()
        return {
            "success": True,
            "commitSha": res.get("commit", {}).get("sha", "")[:7],
            "commitUrl": res.get("commit", {}).get("html_url")
        }
    raise HTTPException(status_code=put.status_code, detail=put.json().get("message", "Sync failed"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=5000, reload=True)

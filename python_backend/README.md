# Kuber — Minimalist GitHub-Synced Expense Tracker

An ultra-minimalist, smart expense tracking application inspired by Vercel and Linear design principles, featuring real-time Indian Rupee (₹) analytics, keyword-based categorization, and automated version-controlled cloud synchronization to your GitHub repository.

---

## 📁 Project Structure

```
├── python_backend/
│   ├── app.py              # Production-ready Flask REST API backend
│   ├── fastapi_app.py      # High-performance FastAPI alternative backend
│   ├── requirements.txt    # Python dependencies
│   ├── expenses.json       # Local JSON database storage
│   └── README.md           # Instructions & API documentation
├── src/
│   ├── components/         # Minimalist UI components (Cards, Charts, Modals)
│   ├── utils/              # Categorizer, GitHub sync engine, INR currency utils
│   ├── types.ts            # TypeScript interface definitions
│   ├── App.tsx             # Main application orchestrator
│   └── main.tsx            # Application entry point
├── index.html              # HTML shell with Google Fonts
└── package.json            # Node.js dependencies
```

---

## 🚀 Running Locally with Python

### Option A: Flask Backend

1. **Navigate to the python_backend directory:**
   ```bash
   cd python_backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows:
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask server:**
   ```bash
   python app.py
   ```
   The Flask API will run on **`http://localhost:5000`**.

---

### Option B: FastAPI Backend

If you prefer FastAPI with automatic OpenAPI interactive documentation at `/docs`:

```bash
uvicorn fastapi_app:app --reload --port 5000
```
Open [http://localhost:5000/docs](http://localhost:5000/docs) in your browser.

---

## 🔑 GitHub Sync Configuration

To back up your expenses directly to a GitHub repository:

1. Create a GitHub Personal Access Token (PAT) with `repo` scope at:
   `https://github.com/settings/tokens`
2. In the Kuber UI Settings panel:
   - **Personal Access Token:** `ghp_yourTokenHere...`
   - **Repository:** `username/my-expenses`
   - **Branch:** `main`
   - **Path:** `expenses.json` (or `expenses.csv`)
3. Click **"Verify & Connect"**, then **"Sync Now"**.
4. Optional: Enable **"Auto-Sync"** so every add, update, or deletion automatically commits to GitHub.

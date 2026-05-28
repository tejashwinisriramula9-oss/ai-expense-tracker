# AI-Enhanced Expense Tracker – Startup Guide

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- ✅ Node.js 16+ installed (`node --version`)
- ✅ Python 3.9+ installed (`python --version`)
- ✅ MongoDB Atlas account (free tier works)
- ✅ Git (optional)

## 🔧 Step-by-Step Setup

### Part 1: Backend Setup (FastAPI + MongoDB)

#### 1. Open Terminal in Backend Folder
```bash
cd "AI expense tracker\backend"
```

#### 2. Create Python Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Configure MongoDB Connection
Edit `.env` file:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.mongodb.net/fintech?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_secret_here
```

Get your MongoDB URI from:
1. Go to mongodb.com → Create account
2. Create a cluster (free tier)
3. Go to "Connect" → Copy connection string
4. Replace `<password>` with your DB password

#### 5. Start Backend Server
```bash
uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

✅ **Backend ready at http://localhost:8000**

---

### Part 2: Frontend Setup (React + Vite)

#### 1. Open New Terminal in Frontend Folder
```bash
cd "AI expense tracker\frontend"
```

#### 2. Install Node Dependencies
```bash
npm install
```

#### 3. Start Development Server
```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 123 ms
  ➜  Local:   http://localhost:5173/
```

✅ **Frontend ready at http://localhost:5173**

---

## 🎯 First Time Usage

### 1. Create Account
- Go to http://localhost:5173
- Click "Create account"
- Fill in: Name, Email, Password
- Click "Create account"

### 2. Login
- Enter your email and password
- Click "Sign in"

### 3. Explore Dashboard
- View your AI expense dashboard
- Check sample transactions
- Try the AI chatbot
- Upload a receipt image

## 🧪 Testing Key Features

### Test AI Chatbot
1. Go to Dashboard
2. Scroll to "AI financial assistant"
3. Click: "How much did I spend this month?"
4. View AI-generated insight

### Add Transaction
1. Go to Transactions page
2. (Backend API ready for POST requests)
3. View sample data

### Check Analytics
1. Go to Analytics page
2. View pie chart by category
3. See monthly expense trend

### Upload Receipt
1. Go to Dashboard
2. Find Receipt Scanner section
3. Upload any image
4. View parsed receipt data

## 📊 API Testing with Postman (Optional)

### Register New User
```
POST http://localhost:8000/register
Body: {
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login
```
POST http://localhost:8000/login
Body: {
  "email": "test@example.com",
  "password": "password123"
}
Response: { "access_token": "..." }
```

### Get Analytics Summary
```
GET http://localhost:8000/analytics/summary
Header: Authorization: Bearer {your_token}
```

## 🐛 Troubleshooting

### Backend won't start
**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**Problem**: `Connection refused` to MongoDB
```bash
# Solution: Check MongoDB URI in .env
# Ensure username:password are correct
# Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0)
```

### Frontend won't start
**Problem**: `npm: command not found`
```bash
# Solution: Install Node.js from nodejs.org
```

**Problem**: `port 5173 already in use`
```bash
# Solution: Kill the process or use different port
# Edit vite.config.js: port: 5174
```

### API calls not working
**Problem**: CORS error in browser console
```bash
# Solution: Ensure backend is running
# Check VITE_API_URL in frontend/.env
```

## 📂 Project Structure at a Glance

```
Backend:
app/
  ├── main.py              ← FastAPI app entry
  ├── db.py                ← MongoDB collections
  ├── schemas.py           ← Data validation models
  ├── core/
  │   ├── config.py        ← Settings
  │   ├── security.py      ← JWT & password hashing
  │   └── dependencies.py  ← Auth middleware
  ├── routes/
  │   ├── auth.py          ← Register/login
  │   ├── transactions.py  ← CRUD transactions
  │   ├── budgets.py       ← Budget management
  │   ├── goals.py         ← Savings goals
  │   ├── analytics.py     ← Dashboard summaries
  │   ├── insights.py      ← AI insights
  │   ├── notifications.py ← Alerts
  │   └── receipts.py      ← Receipt scanning
  └── utils/
      ├── ai.py            ← AI insight logic
      └── ocr.py           ← Receipt parsing

Frontend:
src/
  ├── App.jsx              ← Router setup
  ├── main.jsx             ← Entry point
  ├── api/
  │   └── axiosConfig.js   ← HTTP client
  ├── components/          ← Reusable UI
  ├── contexts/            ← Auth & Theme
  ├── pages/               ← Route pages
  └── utils/               ← Helpers
```

## 🚀 Next Steps

1. **Customize**: Edit components to match your brand
2. **Add Features**: Integrate real OCR, connect to banking APIs
3. **Deploy**: Use Vercel (frontend) + Railway/Heroku (backend)
4. **Scale**: Add more AI features, export reports, social sharing

## 📚 Documentation Links

- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/
- MongoDB: https://www.mongodb.com/docs/

## 💬 Need Help?

- Check the main README.md for feature details
- Review API endpoints in the backend code comments
- Check browser console for frontend errors
- Review terminal output for backend errors

## ✨ You're All Set!

Your AI-Enhanced Expense Tracker is now running! 🎉

Enjoy tracking your finances with AI-powered insights! 💰

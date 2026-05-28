# 🚀 QUICK START - AI Enhanced Expense Tracker

## Prerequisites
- Node.js 14+ installed
- MongoDB Atlas account (free tier)
- Terminal/Command Prompt

---

## ⚡ Backend Setup (5 minutes)

### Step 1: Configure MongoDB
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster (free tier)
4. Click "Connect" → Copy your connection string
5. Replace `<username>` and `<password>` with your credentials

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Update .env file with your MongoDB URI
# Open .env and change:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fintech

# Install dependencies
npm install

# Start backend server
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on http://localhost:5000
```

✅ **Backend Ready!**

---

## ⚡ Frontend Setup (5 minutes)

### In a NEW terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
```

✅ **Frontend Ready!**

---

## 🎯 Access Your App

1. Open http://localhost:5173 in your browser
2. Create an account with email and password
3. Start tracking your expenses!

---

## 🧪 Test the Connection

### Create a Test User:
1. Go to http://localhost:5173
2. Click "Create account"
3. Fill in: Name, Email, Password
4. Click "Create account"
5. Login with your credentials

### Add Sample Transaction:
- Go to Dashboard
- View sample data
- Check charts and analytics

---

## 🔗 API Endpoints (For Testing)

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/profile` - Get profile (requires token)

### Transactions
- `GET /transactions` - List all
- `POST /transactions` - Create
- `PUT /transactions/:id` - Update
- `DELETE /transactions/:id` - Delete

### Budgets
- `GET /budgets` - List all
- `POST /budgets` - Create
- `PUT /budgets/:id` - Update
- `DELETE /budgets/:id` - Delete

### Goals
- `GET /goals` - List all
- `POST /goals` - Create
- `PUT /goals/:id` - Update
- `DELETE /goals/:id` - Delete

### Analytics
- `GET /analytics/summary` - Spending summary
- `GET /analytics/forecast` - 7-day forecast

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### MongoDB Connection Error
```
Error: MongoServerError: bad auth
```
✅ **Solution:** Check your MongoDB URI credentials in .env

### Frontend shows "Connection Refused"
```
ERR_CONNECTION_REFUSED localhost:5000
```
✅ **Solution:** 
1. Make sure backend is running on port 5000
2. Check VITE_API_URL in frontend/.env is http://localhost:5000

### Port already in use
```bash
# Kill process using port 5000 (backend)
# Windows: taskkill /PID <pid> /F
# Mac/Linux: kill -9 <pid>
```

---

## 📊 Project Structure

```
AI expense tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
└── README.md
```

---

## 🎓 Features Included

✅ User Authentication
✅ Add/Edit/Delete Transactions
✅ Budget Management
✅ Savings Goals Tracker
✅ Analytics & Charts
✅ Dark/Light Mode
✅ Responsive Design
✅ MongoDB Integration
✅ JWT Security

---

## ✨ Next Steps

1. **Customize** the UI colors and branding
2. **Add more features** like receipt scanner
3. **Deploy** to production (Vercel + Railway)
4. **Integrate** with banking APIs

---

## 💪 You're all set!

Your AI-Enhanced Expense Tracker is ready to track finances like a pro! 🚀

For detailed documentation, see README.md

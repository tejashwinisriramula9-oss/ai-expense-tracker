# 🚀 RUN YOUR APP - QUICK COMMANDS

## ⚡ ONE-TIME SETUP

### Setup Backend

```bash
cd backend
npm install
```

### Setup Frontend

```bash
cd frontend
npm install
```

---

## 🎯 DAILY STARTUP (What you run every time)

### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on http://localhost:5000
```

### Terminal 2 - Frontend Server

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 📱 ACCESS YOUR APP

Open in browser:
```
http://localhost:5173
```

---

## 🔧 IMPORTANT - First Time Only!

### Update MongoDB Connection

Edit `backend/.env` and add your MongoDB URI:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fintech?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

Get your URI from: https://www.mongodb.com/cloud/atlas

---

## ✅ VERIFICATION CHECKLIST

After running both servers:

- [ ] Backend shows "✅ MongoDB Connected Successfully"
- [ ] Backend shows "🚀 Server running on http://localhost:5000"
- [ ] Frontend shows "VITE ready"
- [ ] Can open http://localhost:5173 in browser
- [ ] Can create account (no errors)
- [ ] Can login successfully

---

## 🐛 QUICK FIXES

### Backend Port in Use
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5000 (Mac/Linux)
lsof -i :5000
kill -9 <PID>
```

### Clear Dependencies
```bash
# Backend
cd backend
rm -r node_modules
npm install
npm run dev

# Frontend
cd frontend
rm -r node_modules
npm install
npm run dev
```

### MongoDB Connection Failed
- Check MongoDB URI in backend/.env
- Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0)
- Ensure username:password are correct

---

## 📊 API Testing

### Test Backend is Running
```bash
curl http://localhost:5000
```

Should return:
```json
{
  "status": "alive",
  "message": "AI Enhanced Expense Tracker API"
}
```

### Test Register User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

---

## 📝 SCRIPT TO RUN EVERYTHING AT ONCE

### Windows Batch File (run.bat)
```batch
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
```

Save as `run.bat` and double-click to run both servers!

### Mac/Linux Shell Script (run.sh)
```bash
#!/bin/bash
cd backend && npm run dev &
cd frontend && npm run dev
```

Run with:
```bash
chmod +x run.sh
./run.sh
```

---

## ✨ YOU'RE SET!

Both servers are running:
- Backend: http://localhost:5000 ✅
- Frontend: http://localhost:5173 ✅

### Next Steps:
1. Create an account
2. Login
3. Start tracking expenses!

---

**Happy tracking! 💰**

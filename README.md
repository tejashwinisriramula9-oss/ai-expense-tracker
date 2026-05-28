# AI Enhanced Expense Tracker

A full-stack fintech dashboard — React + Vite frontend, Node/Express backend, MongoDB Atlas.

---

## Project Structure

```
AI expense tracker/
├── frontend/          ← React + Vite + Tailwind  (deploy to Vercel)
└── backend/           ← Express + MongoDB Atlas   (deploy to Render)
```

---

## Local Development

### 1. Backend
```bash
cd backend
cp .env.example .env      # fill in your MongoDB URI and JWT secret
npm install
npm run dev               # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm install
npm run dev               # runs on http://localhost:5173
```

---

## Deploy — Backend on Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Runtime:** Node
4. Add **Environment Variables** in the Render dashboard:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | A long random secret |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |

5. Deploy — copy the Render URL (e.g. `https://ai-expense-tracker-api.onrender.com`)

---

## Deploy — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

5. Deploy — your app is live!

---

## After Both Are Deployed

Go back to **Render → Environment Variables** and update:
```
FRONTEND_URL = https://your-app.vercel.app
```
This ensures CORS allows requests from your Vercel domain.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion |
| Charts | Chart.js 4, react-chartjs-2 |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas (Mongoose 7) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Hosting | Vercel (frontend) + Render (backend) |

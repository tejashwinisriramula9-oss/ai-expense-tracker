# AI Enhanced Expense Tracker

### Live Website
https://ai-expense-tracker-two-gamma.vercel.app

### Backend API
https://ai-expense-tracker-jrae.onrender.com

---

# Project Description

The AI Enhanced Expense Tracker is a modern full-stack finance management web application developed using the MERN Stack including MongoDB, Express.js, React.js, and Node.js. The application helps users manage expenses, monitor budgets, track savings goals, and analyze spending patterns through interactive dashboards and analytics.

---

# Objectives

1. Develop a smart financial management system for tracking daily income and expenses efficiently.

2. Analyze user spending habits and provide meaningful financial insights using analytics features.

3. Allow users to create, update, organize, and remove expense and income records easily.

4. Generate financial reports and summaries based on categories, budgets, and selected time periods.

5. Display financial information visually using charts, graphs, and interactive dashboards.

---

# Features

## User Authentication and Authorization

The application includes a secure JWT-based authentication system for user registration and login. Protected routes ensure that every user can securely access only their own financial data.

## Expense and Transaction Management

Users can add, edit, delete, search, and filter transactions efficiently. The platform supports expense categorization, real-time balance calculations, and CSV export functionality for transaction records.

## Dashboard and Analytics

The dashboard provides a complete overview of total balance, income, and expenses. It also includes monthly analytics, category-wise spending analysis, trend monitoring, and interactive visual reports using Chart.js.

## Budget and Savings Goals

Users can create budgets, monitor spending limits, and track savings goals. The system also provides overspending indicators and goal progress visualization.

## Responsive User Interface

The application features a fully responsive dark-themed user interface with smooth animations and optimized layouts for both desktop and mobile devices.

---

# Technical Architecture

## Frontend

The frontend was developed using React.js and Vite for fast and efficient performance. Tailwind CSS was used to design the responsive user interface, while Chart.js was integrated for analytics visualization.

### Technologies Used

- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Chart.js

## Backend

The backend was built using Node.js and Express.js to develop RESTful APIs.

### Implemented Features

- JWT Authentication
- Protected Routes
- CRUD Operations
- Middleware-based Authorization

## Database

MongoDB Atlas was used to store user information, transactions, budgets, and savings-related data using Mongoose ODM.

## Deployment

- Frontend deployed on Vercel
- Backend deployed on Render

---

# Run Locally

## Clone the Repository

```bash
git clone https://github.com/your-username/ai-expense-tracker.git
```

## Navigate to Project Directory

```bash
cd ai-expense-tracker
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Install Backend Dependencies

```bash
cd backend
npm install
```

## Start Frontend Server

```bash
npm run dev
```

## Start Backend Server

```bash
npm run server
```

---

# Environment Variables

Create a `.env` file inside the backend folder and add the following:

```env
MONGO_URI=mongodb://tejashwini19:tejashwini1919@ac-n7bjxq2-shard-00-00.9tdzi7c.mongodb.net:27017,ac-n7bjxq2-shard-00-01.9tdzi7c.mongodb.net:27017,ac-n7bjxq2-shard-00-02.9tdzi7c.mongodb.net:27017/expense_tracker?ssl=true&replicaSet=atlas-bb95ab-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=ai_expense_tracker_secret_key
PORT=5001
```

---

# Tech Stack

## Frontend

- React.js
- Tailwind CSS
- Vite
- Framer Motion
- Chart.js

## Backend

- Node.js
- Express.js

## Database

- MongoDB Atlas

---

# Screenshots

## Dashboard Overview
![Dashboard Overview](./dashboard.png)

## Expense Transactions
![Expense Transactions](./transactions.png)

## Financial Analytics
![Financial Analytics](./analytics.png)

## Spending Analysis
![Spending Analysis](./analyze.png)

## Budget Management
![Budget Management](./budget.png)

## Savings Goals
![Savings Goals](./goals.png)

## Savings Insights Dashboard
![Savings Insights Dashboard](./expense-tracker-ui.png)

---

# Future Improvements

- AI-based spending prediction
- Smart budgeting recommendations
- Expense reminders and notifications
- Mobile application support
- Multi-user financial sharing

---

# Demo

Live Demo:
https://ai-expense-tracker-two-gamma.vercel.app

---

# License

This project is licensed under the MIT License.

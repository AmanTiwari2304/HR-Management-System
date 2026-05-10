# 🏢 HR Management System

A full-stack Human Resource Management System built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and styled with **Tailwind CSS**. Designed to streamline core HR operations including employee management, attendance tracking, and leave approvals — with a clean role-based access system for Admins and Employees.

---

## 🚀 Live Demo

> Add your deployed links here after hosting on  Vercel

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-api.vercel.com`

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure JWT-based login and logout
- Role-based access control — **Admin** and **Employee** roles
- Admin registration protected by a secret key
- Passwords hashed with **bcrypt**
- Token auto-attached to all API requests via Axios interceptors
- Auto-redirect on session expiry (401 handling)

### 👥 Employee Management *(Admin only)*
- Add new employees — automatically creates their login account
- Edit employee details (department, designation, salary, etc.)
- Delete employee — also removes their login account
- View all employees in a searchable, paginated table
- Employee status tracking (Active / Inactive)

### 📅 Attendance Management
- Admin can mark attendance for any employee (Present / Absent / Late / Half Day)
- Check-in and check-out time recording
- Monthly attendance filter by month and year
- Employees can view their own attendance history
- Duplicate attendance prevention (one record per employee per day)
- Attendance summary cards (Present / Absent / Late / Half Day counts)

### 🌴 Leave Management
- Employees can apply for leave (Sick / Casual / Earned / Maternity / Other)
- Auto-calculates number of days from date range
- Admin can review, approve, or reject leave requests with remarks
- Employees see their leave history and admin decisions
- Filter leaves by status (All / Pending / Approved / Rejected)

### 📊 Dashboard *(Admin only)*
- Total employee count with active breakdown
- Today's attendance summary (present, absent, half-day counts)
- Pending leave requests count at a glance
- **Bar chart** — Attendance trends over the last 7 days (Recharts)
- **Department headcount** with visual progress bars
- Leave summary panel (Pending / Approved / Rejected totals)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router v6 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Dev Tools | Vite, Nodemon |
| Deployment | Vercel|

---

## 📁 Project Structure
hr-system/
├── backend/
│   ├── server.js               # Entry point, DB connection
│   ├── .env                    # Environment variables
│   ├── middleware/
│   │   └── auth.js             # JWT protect + adminOnly middleware
│   ├── models/
│   │   ├── User.js             # Auth user schema
│   │   ├── Employee.js         # Employee profile schema
│   │   ├── Attendance.js       # Attendance records schema
│   │   └── Leave.js            # Leave requests schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   └── dashboardController.js
│   └── routes/
│       ├── auth.js
│       ├── employees.js
│       ├── attendance.js
│       ├── leaves.js
│       └── dashboard.js
└── frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── context/
│   │   └── AuthContext.jsx  # Global auth state
│   ├── utils/
│   │   └── api.js           # Axios instance with interceptors
│   ├── components/
│   │   └── shared/
│   │       ├── Layout.jsx
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── ProtectedRoute.jsx
│   └── pages/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Dashboard.jsx
│       ├── Employees.jsx
│       ├── Attendance.jsx
│       └── Leaves.jsx
└── tailwind.config.js
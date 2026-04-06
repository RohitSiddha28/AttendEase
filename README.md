# AttendEase - Attendance Management System

A full-stack MERN attendance management application built for educators.

Stack: MongoDB, Express, React (Vite), Node.js, Tailwind CSS, JWT, Nodemailer OTP verification

---

## Features

- Registration with email OTP verification
- Login with email and password for verified users
- Create and manage classes
- Add and remove students
- Add and remove subjects
- Mark attendance by class, subject, and date
- Delete attendance for any saved day
- Student-wise analytics with attendance percentage and history
- Daily attendance history by subject

---

## Project Structure

```text
attendEase/
|-- backend/
|   |-- middleware/
|   |   `-- auth.js          JWT auth middleware
|   |-- models/
|   |   |-- Attendance.js
|   |   |-- Class.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- attendance.js
|   |   |-- auth.js
|   |   `-- classes.js
|   |-- package.json
|   |-- package-lock.json
|   `-- server.js
`-- frontend/
    |-- src/
    |   |-- components/
    |   |   `-- Navbar.jsx
    |   |-- context/
    |   |   `-- AuthContext.jsx
    |   |-- pages/
    |   |   |-- AnalyticsPage.jsx
    |   |   |-- AttendancePage.jsx
    |   |   |-- ClassPage.jsx
    |   |   |-- DashboardPage.jsx
    |   |   `-- LoginPage.jsx
    |   |-- utils/
    |   |   `-- api.js
    |   |-- App.jsx
    |   |-- index.css
    |   `-- main.jsx
    |-- index.html
    |-- package.json
    |-- package-lock.json
    |-- postcss.config.js
    |-- tailwind.config.js
    `-- vite.config.js
```

---

## Prerequisites

- Node.js 18 or later
- MongoDB local instance or MongoDB Atlas
- Gmail account with an App Password for OTP emails

---

## Backend Setup

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendease
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

Notes:

- `EMAIL_USER` and `EMAIL_PASS` are required for registration OTP emails.
- `CLIENT_URL` should match your frontend dev URL.
- If you use MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

Start the backend:

```bash
# Development
npm run dev

# Production
npm start
```

Backend runs on `http://localhost:5000` by default.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

---

## Authentication Flow

### Register

1. User enters name, email, and password.
2. Backend creates or updates a pending unverified account.
3. Backend sends a 6-digit OTP email valid for 10 minutes.
4. User verifies the OTP.
5. Backend marks the account as verified and returns a JWT.

### Login

1. Verified user enters email and password.
2. Backend validates credentials.
3. JWT is returned and stored in `sessionStorage`.

### Session Handling

- JWT is sent with API requests through the Axios interceptor.
- Auth state is restored from `sessionStorage` on refresh.
- Protected routes require a valid token.

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create/update pending account and send registration OTP |
| POST | `/api/auth/verify-registration` | Verify registration OTP and get JWT |
| POST | `/api/auth/login` | Login with email and password |
| GET | `/api/auth/me` | Get current authenticated user |

### Classes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/classes` | Get all classes for current user |
| POST | `/api/classes` | Create a class |
| GET | `/api/classes/:id` | Get a single class |
| DELETE | `/api/classes/:id` | Delete a class and its attendance |
| POST | `/api/classes/:id/students` | Add a student |
| DELETE | `/api/classes/:id/students/:studentName` | Remove a student |
| POST | `/api/classes/:id/subjects` | Add a subject |
| DELETE | `/api/classes/:id/subjects/:subjectName` | Remove a subject |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attendance/:classId` | Get all attendance records for a class |
| POST | `/api/attendance/:classId` | Create or update attendance for a subject and date |
| DELETE | `/api/attendance/:classId/:subject/:date` | Delete attendance for a saved day |
| GET | `/api/attendance/:classId/analytics/student?name=X` | Get student analytics for a class |

---

## Security Notes

- Passwords are hashed with `bcryptjs` before storage.
- Registration OTP expires in 10 minutes.
- JWT auth is used for protected endpoints.
- Rate limiting is enabled for both general API usage and auth endpoints.
- Class and attendance data are restricted to the owner of the account.

Current rate limits in `backend/server.js`:

- General API: 100 requests per 15 minutes
- Auth endpoints: 20 requests per minute
- Successful auth requests are skipped from the auth limiter count

---

## Tech Notes

- Frontend uses React Router and Context API for auth state.
- Frontend build tool is Vite.
- Backend uses Express with Mongoose models.
- Attendance records are unique per class, subject, and date.

---

## Submission Notes

- MERN stack project with JWT-based protected routes
- OTP verification during registration
- Password-based login for verified users
- REST API with separate auth, class, and attendance modules
- Analytics view for attendance insights

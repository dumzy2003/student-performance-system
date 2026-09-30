# Student Performance System

A student performance portal for managing login, academic results, attendance, profile data, and password management. The project uses a Node.js + Express backend with a MySQL database and a static HTML/CSS/JavaScript frontend.

## Overview

This system allows students to:

- log in with their matric number and password
- view their dashboard summary
- track academic performance and results
- view attendance records
- check profile information
- update their password
- browse assigned courses and academic status

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL
- Authentication: JWT + bcryptjs
- CORS: enabled for frontend-backend communication

## Project Structure

```text
student-performance-system/
├── backend/
│   ├── create-users.js
│   ├── db.js
│   ├── package.json
│   ├── server.js
│   └── middleware/
│       └── authMiddleware.js
├── frontend/
│   ├── attendance.html
│   ├── courses.html
│   ├── dashboard.html
│   ├── index.html
│   ├── profile.html
│   ├── results.html
│   ├── settings.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── login.js
│       └── main.js
├── README.md
└── .env (to be created in backend)
```

## Features

### Student Authentication
- student login via matric number and password
- JWT-based protected access for student routes
- login response includes token and student details

### Dashboard
- welcome message with student name
- academic status based on real result data
- attendance and performance metrics
- dynamic initials avatar generation

### Profile Page
- student personal details
- department and level information
- DOB formatting
- name and matric number display

### Results Page
- course results fetched from the backend
- score and grade display
- pass/fail summary and academic status rules

### Attendance Page
- attendance percentages for each course
- progress bars and summary indicators
- attendance threshold monitoring

### Settings Page
- password update flow
- current password validation
- new password hashing
- secure password update endpoint

## Backend API Highlights

The backend exposes protected and public endpoints such as:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/student/cgpa`
- `GET /api/student/average-score`
- `GET /api/student/attendance`
- `GET /api/student/results`
- `GET /api/student/attendance-records`
- `GET /api/student/courses`
- `GET /api/student/course-count`
- `POST /api/student/change-password`

## Default Password

The project seeds student users with the default password:

```text
Student@123
```

This is handled in `backend/create-users.js` using bcrypt hashing.

## Database Setup

Create a MySQL database and configure the backend environment variables.

### Example `.env` file

Create a `.env` file inside the `backend` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_portal
JWT_SECRET=your_secret_key

# Email configuration for password reset emails
# Use a real inbox/domain you control, or a dev email-testing service such as Mailtrap.
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_password
```

For password reset testing, prefer a real inbox/domain you control or a development email-testing service like Mailtrap, Ethereal, or a sandbox SMTP provider. Avoid sending reset emails through a personal Gmail account in local development.

Make sure your MySQL server is running and the database exists before starting the backend.

## Installation

From the project root:

```bash
cd backend
npm install
```

## Run the Project

### 1. Start the backend

```bash
cd backend
node server.js
```

The server listens on:

```text
http://localhost:5000
```

### 2. Open the frontend

Open the frontend pages directly in the browser, for example:

```text
frontend/index.html
```

or use a live preview tool such as a VS Code Live Server extension.

## Notes

- The frontend is static HTML and vanilla JavaScript, not a framework-based app.
- Authentication is managed using JWT tokens stored in localStorage.
- The project is designed for student-level academic data and dashboard viewing.
- The password change feature requires the user to be logged in and provide the current password.

## Potential Improvements

- add server-side photo upload support for profile images
- add admin dashboard and staff login
- add database migration scripts
- add unit/integration tests
- add validation and error handling improvements
- improve project security and deployment setup

## License

This project is currently provided as a student project/demo application for academic and development use.

# AI Log Analyzer

An AI-powered full-stack web application that enables users to upload, parse, analyze, visualize, and generate intelligent insights from system log files.

The application automatically extracts structured log events, classifies log severity, detects anomalies, generates interactive dashboards, and uses **Google Gemini AI** to provide system health analysis, root cause identification, and actionable recommendations.

---

# Project Overview

Modern applications generate thousands of log entries every day, making manual analysis slow and error-prone.

AI Log Analyzer simplifies this process by allowing users to upload log files and instantly receive:

- Structured parsed logs
- Error classification
- Severity statistics
- Interactive charts
- AI-generated summaries
- Downloadable CSV and PDF reports

The application provides a secure, user-specific workspace where each user can manage and analyze only their own uploaded logs.

---

# Features

## Authentication

- User Registration
- User Login
- JWT Authentication
- Refresh Token Authentication
- Secure Logout
- Protected Routes
- User-specific data isolation

---

## Upload Management

- Upload `.log` and `.txt` files
- Maximum upload size: **10 MB**
- Secure UUID-based file storage
- Upload History
- Delete Uploaded Files
- Automatic upload synchronization across pages

---

## Log Parsing

Extracts structured information including:

- Timestamp
- Log Level
- Module
- Service
- Error Code
- Message

Supported Levels:

- INFO
- DEBUG
- WARNING
- ERROR
- CRITICAL

---

## Parsed Logs

- Search logs
- Level filtering
- Sort by every column
- Pagination
- CSV Export
- PDF Export
- Upload selection synchronization

---

## Dashboard

Interactive analytics dashboard showing:

- Total Logs
- Total Errors
- Total Warnings
- Critical Events
- Error Rate
- Log Distribution Chart
- Hourly Activity Chart

---

## AI Analysis

Powered by **Google Gemini AI**

Generates:

- Overall System Health
- Critical Issues
- Performance Concerns
- Security Concerns
- Possible Root Causes
- Recommended Actions

---

## Reports

Generate downloadable reports including:

- CSV Report
- PDF Report
- AI Summary
- Statistics Overview

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts
- React Icons

---

## Backend

- FastAPI
- Python
- JWT Authentication
- SQLAlchemy
- Alembic

---

## Database

- SQLite

---

## Artificial Intelligence

- Google Gemini API

---

## Authentication

- JWT Access Tokens
- Refresh Tokens

---

# Project Structure

```
AI-Log-Analyzer
│
├── backend
│   ├── auth
│   ├── models
│   ├── routes
│   ├── services
│   ├── app.py
│   ├── parser.py
│   ├── analyzer.py
│   ├── ai_summary.py
│   ├── report_generator.py
│   └── visualization.py
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── layouts
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   └── App.jsx
│   │
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── migrations
├── sample_logs
├── requirements.txt
├── alembic.ini
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd AI-Log-Analyzer
```

---

# Backend Setup

Activate virtual environment

```bash
python -m venv venv
```

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn backend.app:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

Production Build

```bash
npm run build
```

---

# Environment Variables

Create a `.env` file inside the backend directory.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

SECRET_KEY=YOUR_SECRET_KEY

DATABASE_URL=sqlite:///./ai_log_analyzer.db

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

# API Endpoints

## Authentication

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /auth/register |
| POST   | /auth/login    |
| POST   | /auth/refresh  |
| POST   | /auth/logout   |
| GET    | /auth/me       |

---

## Upload

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | /upload              |
| GET    | /uploads/history     |
| DELETE | /uploads/{upload_id} |

---

## Analysis

| Method | Endpoint                         |
| ------ | -------------------------------- |
| GET    | /statistics/id/{upload_id}       |
| GET    | /charts/id/{upload_id}           |
| GET    | /analyze-uploaded/id/{upload_id} |
| GET    | /ai-summary/id/{upload_id}       |

---

## Reports

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | /report/csv/id/{upload_id} |
| GET    | /report/pdf/id/{upload_id} |

---

# Application Workflow

1. Register a new account.
2. Login securely.
3. Upload a system log file.
4. Parse structured log events.
5. View parsed logs.
6. Search, sort, and filter logs.
7. Analyze statistics.
8. Visualize charts.
9. Generate AI insights.
10. Download CSV/PDF reports.
11. Delete uploaded logs when no longer required.

---

# Screenshots

Add screenshots before submission.

Suggested screenshots:

- Login Page
- Register Page
- Dashboard
- Upload Logs
- Parsed Logs
- AI Analysis
- Reports
- Swagger API Documentation

Example folder:

```
screenshots/
    login.png
    dashboard.png
    upload.png
    parsed_logs.png
    ai_analysis.png
    reports.png
```

---

# Security Features

- JWT Authentication
- Refresh Token Support
- Password Hashing
- User-specific Upload Isolation
- Protected API Routes
- Secure File Upload Validation
- UUID-based File Storage

---

# Future Improvements

- Docker Deployment
- PostgreSQL Support
- Elasticsearch Integration
- Kibana Dashboard Integration
- Multi-file Comparison
- Advanced AI Analytics
- Cloud Storage Integration
- Email Report Scheduling

---

# Author

**Astha Sandilya**

B.Tech Computer Science Engineering

AI & Full Stack Developer

Vivekananda Global University

---

# License

This project has been developed for educational and academic purposes.

# AI Log Analyzer

AI Log Analyzer is a production-ready full-stack web application that helps users upload, parse, analyze, visualize, and generate AI-powered insights from system log files.

The application automatically extracts structured log information, classifies log severity, generates interactive dashboards, and leverages Google Gemini AI to provide intelligent summaries, root cause analysis, security observations, performance insights, and actionable recommendations.

---

# Project Overview

Modern applications generate thousands of log entries every day, making manual log analysis difficult and time-consuming. AI Log Analyzer simplifies this process by transforming raw log files into meaningful insights through automation and artificial intelligence.

Users can securely upload log files, view parsed log entries, analyze statistics, visualize system behavior through interactive charts, and generate downloadable reports. Every user's data is isolated using secure authentication and authorization mechanisms.

---

# Key Features

## Authentication & Security

- User Registration
- Secure Login
- JWT Access Authentication
- Refresh Token Authentication
- Password Hashing
- Protected Routes
- Protected REST APIs
- User-specific Data Isolation
- Secure Logout

---

## Upload Management

- Upload `.log` and `.txt` files
- Maximum upload size of **10 MB**
- UUID-based secure file storage
- File validation
- Upload history
- Delete uploaded files
- Upload status tracking

---

## Log Parsing

Automatically extracts:

- Timestamp
- Log Level
- Module
- Service
- Error Code
- Message

Supported log levels:

- INFO
- DEBUG
- WARNING
- ERROR
- CRITICAL

---

## Parsed Logs

- Search logs
- Advanced filtering
- Column sorting
- Pagination
- Upload selection
- CSV Export
- PDF Export

---

## Dashboard

Interactive dashboard with:

- Total Uploaded Files
- Total Parsed Logs
- INFO Count
- DEBUG Count
- WARNING Count
- ERROR Count
- CRITICAL Count
- Success Rate
- Recent Upload Activity
- AI Summary Card

Interactive charts include:

- Log Distribution
- Hourly Activity
- Daily Activity
- Severity Distribution
- Error Timeline

---

## AI Analysis

Powered by Google Gemini AI.

Generates:

- Executive Summary
- System Health Analysis
- Root Cause Analysis
- Performance Insights
- Security Observations
- High Priority Issues
- AI Recommendations

---

## Reports

Generate downloadable reports including:

- CSV Reports
- PDF Reports
- Parsed Log Reports
- AI Summary Reports
- Statistics Reports

---

# Technology Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- React Dropzone
- React Icons
- Context API

---

## Backend

- FastAPI
- Python
- SQLAlchemy
- Alembic
- Pydantic
- Passlib
- Python-Jose
- Uvicorn

---

## Database

- PostgreSQL

---

## Artificial Intelligence

- Google Gemini API

---

## Authentication

- JWT Access Token
- Refresh Token
- Password Hashing

---

## Deployment

- Docker
- Docker Compose
- Render
- Vercel

---

# System Architecture

The application follows a secure client-server architecture where the frontend communicates with the backend using REST APIs secured by JWT authentication.

```text
                     +----------------------+
                     |    React Frontend    |
                     +----------+-----------+
                                |
                                | REST API
                                | JWT Authentication
                                |
                     +----------v-----------+
                     |    FastAPI Backend   |
                     +----------+-----------+
                                |
             +------------------+------------------+
             |                  |                  |
             |                  |                  |
      +------v------+    +------v------+    +------v------+
      | PostgreSQL  |    | Gemini AI   |    | File Storage|
      |  Database   |    | Integration |    |   Uploads   |
      +-------------+    +-------------+    +-------------+
```

---

# Software Architecture

The backend follows a modular layered architecture for scalability and maintainability.

```text
Presentation Layer
        │
        ▼
Authentication Layer
        │
        ▼
API Routes
        │
        ▼
Service Layer
        │
        ▼
Parser & AI Layer
        │
        ▼
Database Layer
        │
        ▼
PostgreSQL
```

Application layers:

- Presentation Layer
- Authentication Layer
- API Layer
- Service Layer
- Parser Layer
- AI Analysis Layer
- Report Generation Layer
- Database Layer

---

# Algorithms and Techniques

## Log Parsing

- Regular Expression (Regex) Parsing
- Pattern Matching
- Structured JSON Conversion

---

## Data Processing

- Severity Classification
- Frequency Counting
- Statistical Aggregation
- Error Categorization
- Timestamp Grouping

---

## Search and Filtering

- Keyword Search
- Multi-level Filtering
- Server-side Pagination
- Dynamic Sorting

---

## Artificial Intelligence

- Prompt Engineering
- Large Language Model (LLM) Analysis
- Root Cause Identification
- AI Recommendation Generation

---

## Data Visualization

- Hourly Aggregation
- Daily Aggregation
- Severity Distribution
- Timeline Generation
- Percentage Calculation

# Project Structure

```text
AI-Log-Analyzer/
│
├── backend/
│   ├── alembic/
│   ├── auth/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── reports/
│   ├── app.py
│   ├── analyzer.py
│   ├── parser.py
│   ├── ai_summary.py
│   ├── report_generator.py
│   ├── visualization.py
│   ├── database.py
│   ├── config.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── Dockerfile
├── docker-compose.yml
├── alembic.ini
├── README.md
└── LICENSE
```

---

# Folder Description

| Folder     | Description                         |
| ---------- | ----------------------------------- |
| backend    | FastAPI backend source code         |
| frontend   | React frontend application          |
| auth       | Authentication and authorization    |
| models     | SQLAlchemy database models          |
| routes     | REST API endpoints                  |
| schemas    | Pydantic request/response models    |
| services   | Business logic implementation       |
| uploads    | Uploaded log files                  |
| reports    | Generated CSV and PDF reports       |
| utils      | Helper functions and utilities      |
| assets     | Images, icons, and static resources |
| components | Reusable React components           |
| pages      | Application pages                   |
| context    | React Context API                   |
| hooks      | Custom React hooks                  |

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/AI-Log-Analyzer.git
```

Navigate to the project directory.

```bash
cd AI-Log-Analyzer
```

---

# Backend Setup

Create a virtual environment.

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install backend dependencies.

```bash
pip install -r requirements.txt
```

Run database migrations.

```bash
alembic upgrade head
```

Start the FastAPI server.

```bash
uvicorn app:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

ReDoc Documentation:

```text
http://127.0.0.1:8000/redoc
```

---

# Frontend Setup

Navigate to the frontend folder.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

Create a production build.

```bash
npm run build
```

Preview the production build.

```bash
npm run preview
```

---

# Environment Variables

Create a `.env` file inside the backend directory.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ai_log_analyzer

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7

GEMINI_API_KEY=your_gemini_api_key
```

---

# Database Configuration

The application uses **PostgreSQL** as the primary database.

Database stores:

- User Accounts
- Login Credentials
- Upload Metadata
- Parsed Log Records
- AI Analysis Results
- Statistics
- Generated Reports
- Upload History

Database migrations are managed using **Alembic**.

---

# Authentication Workflow

```text
User Registration
        │
        ▼
User Login
        │
        ▼
JWT Access Token Generated
        │
        ▼
Access Protected APIs
        │
        ▼
Upload & Analyze Logs
        │
        ▼
Refresh Token (if required)
        │
        ▼
Secure Logout
```

# File Upload Workflow

```text
Select Log File
        │
        ▼
Validate File
        │
        ▼
Upload to Server
        │
        ▼
Store Using UUID
        │
        ▼
Parse Log Entries
        │
        ▼
Save Parsed Data
        │
        ▼
Generate Statistics
        │
        ▼
Generate AI Summary
```

# Log Processing Pipeline

```text
Raw Log File
      │
      ▼
Upload Module
      │
      ▼
Parser Engine
      │
      ▼
Structured Log Data
      │
      ▼
Statistics Generator
      │
      ▼
Visualization Engine
      │
      ▼
Gemini AI Analysis
      │
      ▼
Reports Generation
```

# REST API Endpoints

## Authentication APIs

| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| POST   | `/auth/register` | Register a new user            |
| POST   | `/auth/login`    | Authenticate user              |
| POST   | `/auth/refresh`  | Refresh access token           |
| POST   | `/auth/logout`   | Logout user                    |
| GET    | `/auth/me`       | Get authenticated user details |

---

## Upload APIs

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | `/upload`              | Upload a log file    |
| GET    | `/uploads`             | Get upload history   |
| GET    | `/uploads/{upload_id}` | Get upload details   |
| DELETE | `/uploads/{upload_id}` | Delete uploaded file |

---

## Parsed Logs APIs

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| GET    | `/parsed-logs/id/{upload_id}`         | View parsed logs          |
| GET    | `/parsed-logs/export/csv/{upload_id}` | Export parsed logs as CSV |
| GET    | `/parsed-logs/export/pdf/{upload_id}` | Export parsed logs as PDF |

---

## Statistics APIs

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| GET    | `/statistics/id/{upload_id}` | Get statistics for a log file |
| GET    | `/statistics/dashboard`      | Dashboard statistics          |

---

## Charts APIs

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/charts/id/{upload_id}` | Generate chart data          |
| GET    | `/charts/dashboard`      | Dashboard visualization data |

---

## AI Analysis APIs

| Method | Endpoint                           | Description          |
| ------ | ---------------------------------- | -------------------- |
| GET    | `/analyze-uploaded/id/{upload_id}` | Generate AI analysis |
| GET    | `/ai-summary/id/{upload_id}`       | Get AI summary       |

---

## Reports APIs

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| GET    | `/report/csv/id/{upload_id}` | Download CSV report |
| GET    | `/report/pdf/id/{upload_id}` | Download PDF report |

---

# Application Workflow

```text
User Registration/Login
          │
          ▼
Authentication
          │
          ▼
Upload Log File
          │
          ▼
File Validation
          │
          ▼
Log Parsing
          │
          ▼
Store Parsed Data
          │
          ▼
Statistics Generation
          │
          ▼
Visualization
          │
          ▼
AI Analysis
          │
          ▼
Generate Reports
```

---

# Dashboard Modules

The dashboard provides a centralized view of log analytics.

## Summary Cards

- Total Uploaded Files
- Total Parsed Logs
- INFO Logs
- DEBUG Logs
- WARNING Logs
- ERROR Logs
- CRITICAL Logs
- Success Rate
- Error Rate

---

## Charts

- Log Distribution Chart
- Severity Distribution Chart
- Hourly Activity Chart
- Daily Activity Chart
- Error Timeline
- Most Frequent Errors

---

## Activity Section

- Recent Uploads
- Upload Status
- Latest AI Analysis
- Report History

---

# Log Analysis Process

The application performs the following analysis:

1. Read uploaded log file.
2. Extract structured log entries.
3. Classify log levels.
4. Detect errors and warnings.
5. Calculate statistics.
6. Generate visualizations.
7. Produce AI insights.
8. Create downloadable reports.

---

# Statistics Generated

The analyzer computes:

- Total Log Entries
- INFO Count
- DEBUG Count
- WARNING Count
- ERROR Count
- CRITICAL Count
- Error Percentage
- Success Percentage
- Most Frequent Error
- Most Frequent Warning
- Hourly Log Distribution
- Daily Log Distribution

---

# AI Analysis

Google Gemini AI analyzes parsed logs and generates intelligent insights.

Generated AI outputs include:

- Executive Summary
- System Health Assessment
- Root Cause Analysis
- Error Pattern Detection
- Performance Analysis
- Security Analysis
- Risk Assessment
- High Priority Issues
- Recommendations
- Overall Conclusion

---

# Report Generation

The application supports exporting analysis results in multiple formats.

Available reports:

- CSV Report
- PDF Report
- Parsed Log Report
- AI Summary Report
- Statistics Report

Each report includes:

- Upload Information
- File Details
- Parsing Summary
- Log Statistics
- Severity Distribution
- AI Insights
- Recommendations
- Generation Timestamp

---

# Visualization Features

Interactive charts help users understand system behavior.

Available visualizations:

- Bar Chart
- Line Chart
- Pie Chart
- Area Chart
- Timeline Chart

Charts provide insights into:

- Error Trends
- Log Distribution
- Severity Breakdown
- Daily Activity
- Hourly Activity
- System Performance

---

# Search and Filtering

The Parsed Logs module supports advanced data exploration.

Features include:

- Keyword Search
- Log Level Filter
- Module Filter
- Service Filter
- Error Code Filter
- Date Filter
- Dynamic Sorting
- Server-side Pagination

---

# Supported Log Levels

The parser recognizes the following standard log levels:

| Level    | Purpose                         |
| -------- | ------------------------------- |
| INFO     | General application information |
| DEBUG    | Debugging information           |
| WARNING  | Potential issues                |
| ERROR    | Application errors              |
| CRITICAL | Critical system failures        |

# Security Features

The application follows industry-standard security practices to ensure user data and uploaded log files remain protected.

## Authentication Security

- JWT Access Token Authentication
- Refresh Token Authentication
- Password Hashing using Passlib
- Protected REST APIs
- Protected Frontend Routes
- Role-based Authorization Ready
- Secure Logout Mechanism

---

## Data Security

- User-specific Data Isolation
- Secure Database Transactions
- Environment Variable Configuration
- Input Validation
- Request Validation
- API Error Handling

---

## File Security

- UUID-based File Storage
- File Type Validation
- Maximum File Size Validation
- Secure File Upload
- Secure File Deletion
- Duplicate Upload Prevention

---

# Error Handling

The application handles common runtime and validation errors gracefully.

Supported error handling includes:

- Invalid Login Credentials
- Invalid JWT Token
- Expired Access Token
- Unauthorized Requests
- Missing Required Fields
- Invalid File Type
- File Size Exceeded
- Empty Log File
- Log Parsing Errors
- Database Connection Errors
- API Validation Errors
- AI Service Errors
- Network Errors

---

# Performance Optimizations

The application is optimized to efficiently process large log files.

Implemented optimizations include:

- Efficient Regex Parsing
- Optimized SQL Queries
- Server-side Pagination
- Server-side Filtering
- Server-side Sorting
- Lazy Loading
- Cached AI Responses
- Optimized API Responses
- Responsive User Interface

---

# Deployment

The project can be deployed using the following technologies.

## Frontend

- Vercel
- Netlify

---

## Backend

- Render
- Railway
- Docker

---

## Database

- PostgreSQL

---

# Docker Support

The application supports containerized deployment.

Included Docker components:

- Dockerfile
- Docker Compose
- Environment Configuration
- Multi-service Deployment
- Production-ready Configuration

---

# Testing

The project can be tested using the following approaches:

## Backend Testing

- API Testing
- Authentication Testing
- Upload Testing
- Parser Testing
- Database Testing
- AI Integration Testing

---

## Frontend Testing

- UI Testing
- Form Validation
- Route Protection
- Responsive Design Testing
- API Integration Testing

---

# Browser Compatibility

The frontend is compatible with modern web browsers.

Supported browsers:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

---

# Screenshots

Add application screenshots before publishing the repository.

Suggested screenshots:

- Login Page
- Registration Page
- Dashboard
- Upload Logs
- Parsed Logs
- AI Analysis
- Reports
- Settings
- Swagger API Documentation

Example folder structure:

```text
screenshots/
│
├── login.png
├── register.png
├── dashboard.png
├── upload.png
├── parsed_logs.png
├── ai_analysis.png
├── reports.png
├── settings.png
└── swagger.png
```

# Future Enhancements

Planned improvements for future versions include:

- Real-time Log Streaming
- Elasticsearch Integration
- Kibana Dashboard Integration
- Redis Caching
- Kubernetes Deployment
- Cloud Storage Support
- Email Report Scheduling
- WebSocket Notifications
- Multi-file Log Comparison
- Advanced AI Analytics
- Role-based Access Control
- Team Collaboration
- Dark Mode Support
- Mobile Application
- Multi-language Support

# Project Highlights

- Production-ready Architecture
- Secure Authentication
- AI-powered Log Analysis
- Interactive Dashboard
- Advanced Log Parsing
- RESTful API Design
- PostgreSQL Database
- Google Gemini AI Integration
- CSV & PDF Report Generation
- Responsive User Interface
- Modular Code Structure
- Docker Deployment Support

# Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

Please follow coding standards and write clear commit messages.

# License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project under the terms of the MIT License.

# Author

\*_Astha _

B.Tech Computer Science Engineering

AI & Full Stack Developer

Vivekananda Global University

### Connect

- GitHub: https://github.com/Astha-in
- LinkedIn: https://www.linkedin.com/in/astha-innet
- Email: astha.innet@gmail.com

# Acknowledgements

This project was built using the following open-source technologies:

- React
- Vite
- Tailwind CSS
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Google Gemini AI
- Recharts
- React Dropzone
- Axios
- Docker

We sincerely thank the open-source community for providing these excellent tools and frameworks.

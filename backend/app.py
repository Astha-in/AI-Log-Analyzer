from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.auth_routes import router as auth_router
from backend.routes.upload_routes import router as upload_router
from backend.routes.logs_routes import router as logs_router
from backend.routes.analysis_routes import router as analysis_router
from backend.routes.chart_routes import router as chart_router
from backend.routes.report_routes import router as report_router
from backend.routes.ai_routes import router as ai_router

app = FastAPI(
    title="AI Log Analyzer API",
    description="Secure AI-powered log analysis API",
    version="1.0.0",
)

# =========================================================
# Middleware
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# Routers
# =========================================================

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(logs_router)
app.include_router(analysis_router)
app.include_router(chart_router)
app.include_router(report_router)
app.include_router(ai_router)

# =========================================================
# Public Routes
# =========================================================

@app.get("/")
def home():
    return {
        "message": "AI Log Analyzer API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
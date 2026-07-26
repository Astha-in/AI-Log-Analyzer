import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.logger import logger
from backend.core.redis_client import check_redis_connection
from backend.database import engine
from backend.routes.ai_routes import router as ai_router
from backend.routes.analysis_routes import router as analysis_router
from backend.routes.auth_routes import router as auth_router
from backend.routes.chart_routes import router as chart_router
from backend.routes.logs_routes import router as logs_router
from backend.routes.report_routes import router as report_router
from backend.routes.upload_routes import router as upload_router

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
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(
    request: Request,
    call_next,
):
    start_time = time.time()

    response = await call_next(request)

    process_time = (
        time.time() - start_time
    ) * 1000

    logger.info(
        f"{request.method} "
        f"{request.url.path} "
        f"{response.status_code} "
        f"{process_time:.2f} ms"
    )

    return response


# =========================================================
# Global Exception Handler
# =========================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(
        f"Unhandled exception while processing "
        f"{request.method} {request.url.path}"
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error",
        },
    )


# =========================================================
# Startup / Shutdown Events
# =========================================================

@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("Starting AI Log Analyzer Backend")

    try:
        connection = engine.connect()
        connection.close()

        logger.info(
            "Database connection established."
        )

    except Exception:
        logger.exception(
            "Database connection failed."
        )

    if check_redis_connection():
        logger.info(
            "Redis connection established."
        )
    else:
        logger.warning(
            "Redis is unavailable."
        )

    logger.info("Backend startup completed.")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("=" * 60)
    logger.info("AI Log Analyzer Backend stopped.")
    logger.info("=" * 60)


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
    logger.info("Home endpoint accessed.")

    return {
        "message": "AI Log Analyzer API is running",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():

    database_status = "connected"

    try:
        connection = engine.connect()
        connection.close()

    except Exception:
        database_status = "disconnected"

    redis_status = (
        "connected"
        if check_redis_connection()
        else "disconnected"
    )

    return {
        "status": "healthy",
        "database": database_status,
        "redis": redis_status,
    }
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "LogSense AI"
    APP_VERSION: str = "2.0.0"

    # Database
    # SQLite is the fallback.
    # If DATABASE_URL exists in .env, it overrides this automatically.
    DATABASE_URL: str = "sqlite:///./logsense.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # JWT
    JWT_SECRET_KEY: str = ""
    JWT_REFRESH_SECRET_KEY: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    # Uploads
    UPLOAD_FOLDER: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
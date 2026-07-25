from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==================================================
    # Application
    # ==================================================
    APP_NAME: str = "LogSense AI"
    APP_VERSION: str = "2.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ==================================================
    # Database
    # ==================================================
    DATABASE_URL: str

    # ==================================================
    # Redis
    # ==================================================
    REDIS_URL: str = "redis://localhost:6379/0"

    # ==================================================
    # JWT
    # ==================================================
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ==================================================
    # Gemini
    # ==================================================
    GEMINI_API_KEY: str

    # ==================================================
    # Uploads
    # ==================================================
    UPLOAD_FOLDER: str = "backend/uploads"
    REPORT_FOLDER: str = "backend/reports"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024

    # ==================================================
    # CORS
    # ==================================================
    FRONTEND_URL: str = "http://localhost:5173"

    # ==================================================
    # Logging
    # ==================================================
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
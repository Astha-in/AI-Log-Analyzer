from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from backend.core.config import settings


SECRET_KEY = settings.JWT_SECRET_KEY
REFRESH_SECRET_KEY = settings.JWT_REFRESH_SECRET_KEY

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_access_token(data: dict) -> str:
    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update(
        {
            "exp": expire,
            "token_type": "access",
        }
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_refresh_token(data: dict) -> str:
    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload.update(
        {
            "exp": expire,
            "token_type": "refresh",
        }
    )

    return jwt.encode(
        payload,
        REFRESH_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        if payload.get("token_type") != "access":
            return None

        return payload

    except JWTError:
        return None


def decode_refresh_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            REFRESH_SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        if payload.get("token_type") != "refresh":
            return None

        return payload

    except JWTError:
        return None


def decode_token(token: str) -> dict | None:
    """
    Backward compatibility.
    Existing code can continue calling decode_token()
    until we migrate all routes.
    """
    payload = decode_access_token(token)

    if payload:
        return payload

    return decode_refresh_token(token)
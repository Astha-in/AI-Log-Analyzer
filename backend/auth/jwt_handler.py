import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import JWTError, jwt


load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise ValueError(
        "JWT_SECRET_KEY not found in environment variables"
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_access_token(data: dict) -> str:
    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({
        "exp": expire,
        "token_type": "access",
    })

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

    payload.update({
        "exp": expire,
        "token_type": "refresh",
    })

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

    except JWTError:
        return None
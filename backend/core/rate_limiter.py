from fastapi import HTTPException, Request
from redis.exceptions import RedisError

from backend.core.redis_client import redis_client


def rate_limit(
    request: Request,
    key_prefix: str,
    limit: int,
    window: int,
):
    """
    Redis-based rate limiter.

    Args:
        request: FastAPI Request object.
        key_prefix: Prefix for Redis key
                    (e.g. login, register, upload).
        limit: Maximum requests allowed.
        window: Time window in seconds.
    """

    client_ip = request.client.host

    redis_key = f"rate_limit:{key_prefix}:{client_ip}"

    try:
        current = redis_client.get(redis_key)

        if current is None:
            redis_client.setex(
                redis_key,
                window,
                1,
            )
            return

        current = int(current)

        if current >= limit:
            ttl = redis_client.ttl(redis_key)

            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Rate limit exceeded.",
                    "retry_after_seconds": ttl,
                },
            )

        redis_client.incr(redis_key)

    except RedisError:
        # If Redis is unavailable, don't block legitimate users.
        # The application continues without rate limiting.
        return
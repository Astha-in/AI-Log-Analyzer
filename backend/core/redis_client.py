try:
    from redis import Redis
    from redis.exceptions import RedisError
except ImportError:
    Redis = None
    RedisError = Exception

from backend.core.config import settings

redis_client = (
    Redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
    )
    if Redis
    else None
)


def check_redis_connection() -> bool:
    """
    Returns True if Redis is reachable.
    """

    if redis_client is None:
        return False

    try:
        redis_client.ping()
        return True
    except RedisError:
        return False
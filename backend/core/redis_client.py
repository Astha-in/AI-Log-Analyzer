from redis import Redis
from redis.exceptions import RedisError

from backend.core.config import settings


redis_client = Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
)


def check_redis_connection() -> bool:
    """
    Returns True if Redis is reachable.
    """

    try:
        redis_client.ping()
        return True

    except RedisError:
        return False
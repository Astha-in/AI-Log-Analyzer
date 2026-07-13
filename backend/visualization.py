from collections import Counter


def generate_chart_data(logs):

    # Count logs by level
    level_counts = Counter(
        log["level"] for log in logs
    )

    log_distribution = [
        {
            "level": level,
            "count": count
        }
        for level, count in level_counts.items()
    ]

    # Count logs by hour
    hourly_counts = Counter(
        log["timestamp"][:13]
        for log in logs
    )

    hourly_activity = [
        {
            "hour": hour,
            "count": count
        }
        for hour, count in sorted(hourly_counts.items())
    ]

    # Error timeline
    error_timeline = [
        {
            "timestamp": log["timestamp"],
            "message": log["message"]
        }
        for log in logs
        if log["level"] in ["ERROR", "CRITICAL"]
    ]

    return {
        "log_distribution": log_distribution,
        "hourly_activity": hourly_activity,
        "error_timeline": error_timeline
    }
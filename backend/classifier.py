from collections import Counter


def classify_logs(logs):
    levels = []

    for log in logs:
        levels.append(log["level"])

    counts = Counter(levels)

    return {
        "INFO": counts.get("INFO", 0),
        "DEBUG": counts.get("DEBUG", 0),
        "WARNING": counts.get("WARNING", 0),
        "ERROR": counts.get("ERROR", 0),
        "CRITICAL": counts.get("CRITICAL", 0)
    }
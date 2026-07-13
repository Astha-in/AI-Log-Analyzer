from collections import Counter


def analyze_logs(logs):
    error_logs = []
    warning_logs = []
    critical_logs = []

    for log in logs:
        if log["level"] == "ERROR":
            error_logs.append(log)

        elif log["level"] == "WARNING":
            warning_logs.append(log)

        elif log["level"] == "CRITICAL":
            critical_logs.append(log)

    error_messages = []

    for log in error_logs:
        error_messages.append(log["message"])

    error_counts = Counter(error_messages)

    most_frequent_error = None

    if error_counts:
        most_frequent_error = error_counts.most_common(1)[0][0]

    total_logs = len(logs)

    error_rate = 0

    if total_logs > 0:
        error_rate = round(
            (len(error_logs) / total_logs) * 100,
            2
        )

    return {
        "total_logs": total_logs,
        "total_errors": len(error_logs),
        "total_warnings": len(warning_logs),
        "critical_errors": len(critical_logs),
        "most_frequent_error": most_frequent_error,
        "error_rate_percent": error_rate
    }
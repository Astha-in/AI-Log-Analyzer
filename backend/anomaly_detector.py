from collections import Counter


def detect_anomalies(logs):
    anomalies = []

    # Rule 1: Every CRITICAL log is an anomaly
    for log in logs:
        if log["level"] == "CRITICAL":
            anomalies.append({
                "type": "critical_event",
                "severity": "high",
                "timestamp": log["timestamp"],
                "message": log["message"]
            })

    # Rule 2: Detect repeated ERROR messages
    error_messages = [
        log["message"]
        for log in logs
        if log["level"] == "ERROR"
    ]

    error_counts = Counter(error_messages)

    for message, count in error_counts.items():
        if count >= 2:
            anomalies.append({
                "type": "repeated_error",
                "severity": "medium",
                "message": message,
                "occurrences": count
            })

    return anomalies
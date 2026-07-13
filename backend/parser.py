import re
from pathlib import Path


LOG_PATTERN = re.compile(
    r"(?P<timestamp>"
    r"\d{4}-\d{2}-\d{2}"
    r"[ T]"
    r"\d{2}:\d{2}:\d{2}"
    r")"
    r"\s+"
    r"(?P<level>"
    r"INFO|DEBUG|WARN|WARNING|ERROR|CRITICAL"
    r")"
    r"\s+"
    r"(?:\[(?P<context>[^\]]+)\])?"
    r"\s*"
    r"(?:(?P<error_code>"
    r"[A-Za-z][A-Za-z0-9_-]*-\d+"
    r")\s+)?"
    r"(?P<message>.*?)"
    r"(?="
    r"\d{4}-\d{2}-\d{2}"
    r"[ T]"
    r"\d{2}:\d{2}:\d{2}"
    r"\s+"
    r"(?:INFO|DEBUG|WARN|WARNING|ERROR|CRITICAL)"
    r"\s+"
    r"|\Z"
    r")",
    re.IGNORECASE | re.DOTALL,
)


def normalize_level(level: str) -> str:
    level = level.upper()

    if level == "WARN":
        return "WARNING"

    return level


def split_context(context):
    if not context:
        return "", ""

    context = context.strip()

    if ":" in context:
        module, service = context.split(":", 1)

        return (
            module.strip(),
            service.strip(),
        )

    return "", context


def clean_message(message: str) -> str:
    return " ".join(
        message.split()
    )


def parse_log_line(log_text: str):
    match = LOG_PATTERN.search(log_text)

    if not match:
        return None

    module, service = split_context(
        match.group("context")
    )

    return {
        "timestamp": (
            match.group("timestamp")
            .replace("T", " ")
        ),
        "level": normalize_level(
            match.group("level")
        ),
        "module": module,
        "service": service,
        "error_code": (
            match.group("error_code") or ""
        ),
        "message": clean_message(
            match.group("message")
        ),
    }


def parse_log_file(file_path):
    path = Path(file_path)

    with path.open(
        "r",
        encoding="utf-8",
        errors="replace",
    ) as file:
        content = file.read()

    parsed_logs = []

    for match in LOG_PATTERN.finditer(content):
        module, service = split_context(
            match.group("context")
        )

        parsed_logs.append(
            {
                "timestamp": (
                    match.group("timestamp")
                    .replace("T", " ")
                ),
                "level": normalize_level(
                    match.group("level")
                ),
                "module": module,
                "service": service,
                "error_code": (
                    match.group("error_code") or ""
                ),
                "message": clean_message(
                    match.group("message")
                ),
            }
        )

    return parsed_logs
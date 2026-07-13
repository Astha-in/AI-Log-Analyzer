import os
import json
import time
import random

from dotenv import load_dotenv
from google import genai


# --------------------------------------------------
# ENVIRONMENT
# --------------------------------------------------

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found")


# --------------------------------------------------
# GEMINI CLIENT
# --------------------------------------------------

client = genai.Client(api_key=api_key)

PRIMARY_MODEL = "gemini-2.5-flash"

MAX_RETRIES = 3


# --------------------------------------------------
# HELPER: CLEAN JSON RESPONSE
# --------------------------------------------------

def clean_json_response(response_text: str) -> str:

    if not response_text:
        raise ValueError(
            "AI returned an empty response"
        )

    cleaned = response_text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned[7:].strip()

    elif cleaned.startswith("```"):
        cleaned = cleaned[3:].strip()

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    return cleaned


# --------------------------------------------------
# HELPER: CHECK TEMPORARY PROVIDER ERROR
# --------------------------------------------------

def is_retryable_error(error: Exception) -> bool:

    error_text = str(error).lower()

    retryable_signals = [
        "503",
        "unavailable",
        "high demand",
        "temporarily unavailable",
        "429",
        "resource_exhausted",
        "rate limit",
        "500",
        "502",
        "504",
        "deadline exceeded",
        "timeout",
    ]

    return any(
        signal in error_text
        for signal in retryable_signals
    )


# --------------------------------------------------
# HELPER: CALL GEMINI WITH RETRY
# --------------------------------------------------

def call_gemini_with_retry(prompt: str):

    last_error = None

    for attempt in range(MAX_RETRIES):

        try:
            print(
                f"AI request attempt "
                f"{attempt + 1}/{MAX_RETRIES}"
            )

            response = client.models.generate_content(
                model=PRIMARY_MODEL,
                contents=prompt
            )

            if not response:
                raise ValueError(
                    "AI provider returned no response"
                )

            response_text = getattr(
                response,
                "text",
                None
            )

            if not response_text:
                raise ValueError(
                    "AI provider returned empty text"
                )

            return response_text

        except Exception as error:

            last_error = error

            print(
                f"AI request failed on attempt "
                f"{attempt + 1}: {error}"
            )

            if not is_retryable_error(error):
                raise

            if attempt < MAX_RETRIES - 1:

                # Exponential backoff:
                # roughly 2s, then 4s
                delay = (
                    2 ** (attempt + 1)
                ) + random.uniform(0, 1)

                print(
                    f"Temporary AI provider error. "
                    f"Retrying in {delay:.1f} seconds..."
                )

                time.sleep(delay)

    raise RuntimeError(
        "AI service is temporarily unavailable "
        "after multiple retry attempts. "
        "Please try again shortly."
    ) from last_error


# --------------------------------------------------
# MAIN AI SUMMARY FUNCTION
# --------------------------------------------------

def generate_ai_summary(
    logs,
    statistics,
    anomalies
):

    if not logs:
        raise ValueError(
            "No logs provided for AI analysis"
        )

    log_data = json.dumps(
        logs,
        indent=2,
        ensure_ascii=False
    )

    statistics_data = json.dumps(
        statistics,
        indent=2,
        ensure_ascii=False
    )

    anomalies_data = json.dumps(
        anomalies,
        indent=2,
        ensure_ascii=False
    )

    prompt = f"""
You are an expert DevOps engineer and AI log analysis assistant.

Analyze the following system log data.

LOGS:
{log_data}

STATISTICS:
{statistics_data}

DETECTED ANOMALIES:
{anomalies_data}

Return ONLY valid JSON.

Use exactly this structure:

{{
  "overall_system_health": "string",
  "critical_issues": ["string"],
  "performance_concerns": ["string"],
  "security_concerns": ["string"],
  "possible_root_causes": ["string"],
  "recommended_actions": ["string"],
  "prevention_tips": ["string"]
}}

Rules:
- Base the analysis only on the provided logs.
- Do not invent unsupported incidents.
- Keep recommendations practical.
- Keep each item concise and actionable.
- Return empty arrays when no issue exists.
- Do not use Markdown.
- Do not wrap JSON in code fences.
"""

    # ----------------------------------------------
    # CALL AI WITH RETRY
    # ----------------------------------------------

    response_text = call_gemini_with_retry(
        prompt
    )

    # ----------------------------------------------
    # CLEAN RESPONSE
    # ----------------------------------------------

    cleaned_text = clean_json_response(
        response_text
    )

    # ----------------------------------------------
    # PARSE JSON
    # ----------------------------------------------

    try:
        result = json.loads(cleaned_text)

    except json.JSONDecodeError as error:

        print(
            "Invalid AI JSON response:",
            cleaned_text
        )

        raise ValueError(
            "AI returned an invalid JSON response"
        ) from error

    # ----------------------------------------------
    # VALIDATE RESPONSE TYPE
    # ----------------------------------------------

    if not isinstance(result, dict):
        raise ValueError(
            "AI response must be a JSON object"
        )

    # ----------------------------------------------
    # NORMALIZE EXPECTED FIELDS
    # ----------------------------------------------

    expected_list_fields = [
        "critical_issues",
        "performance_concerns",
        "security_concerns",
        "possible_root_causes",
        "recommended_actions",
        "prevention_tips",
    ]

    for field in expected_list_fields:

        value = result.get(field)

        if value is None:
            result[field] = []

        elif isinstance(value, str):
            result[field] = [value]

        elif not isinstance(value, list):
            result[field] = []

    if not result.get("overall_system_health"):
        result["overall_system_health"] = "Unknown"

    return result
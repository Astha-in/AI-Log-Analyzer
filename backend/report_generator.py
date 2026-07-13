from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)
from reportlab.lib import colors


def generate_pdf_report(
    report_path,
    filename,
    logs,
    statistics,
    anomalies,
    ai_summary
):
    doc = SimpleDocTemplate(
        report_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    story = []

    title_style = styles["Title"]
    title_style.alignment = TA_CENTER

    story.append(
        Paragraph(
            "AI Log Analyzer Report",
            title_style
        )
    )

    story.append(Spacer(1, 12))

    story.append(
        Paragraph(
            f"<b>Analyzed File:</b> {filename}",
            styles["Normal"]
        )
    )

    story.append(Spacer(1, 20))

    # Statistics section
    story.append(
        Paragraph(
            "System Statistics",
            styles["Heading2"]
        )
    )

    statistics_data = [
        ["Metric", "Value"],
        ["Total Logs", statistics.get("total_logs", 0)],
        ["Total Errors", statistics.get("total_errors", 0)],
        ["Total Warnings", statistics.get("total_warnings", 0)],
        ["Critical Errors", statistics.get("critical_errors", 0)],
        [
            "Most Frequent Error",
            statistics.get(
                "most_frequent_error",
                "None"
            )
        ],
        [
            "Error Rate",
            f'{statistics.get("error_rate_percent", 0)}%'
        ]
    ]

    statistics_table = Table(
        statistics_data,
        colWidths=[180, 300]
    )

    statistics_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("PADDING", (0, 0), (-1, -1), 6)
        ])
    )

    story.append(statistics_table)
    story.append(Spacer(1, 20))

    # Anomalies section
    story.append(
        Paragraph(
            "Detected Anomalies",
            styles["Heading2"]
        )
    )

    if anomalies:
        for anomaly in anomalies:
            anomaly_text = (
                f"<b>Type:</b> {anomaly.get('type', 'N/A')}<br/>"
                f"<b>Severity:</b> {anomaly.get('severity', 'N/A')}<br/>"
                f"<b>Message:</b> {anomaly.get('message', 'N/A')}"
            )

            story.append(
                Paragraph(
                    anomaly_text,
                    styles["Normal"]
                )
            )

            story.append(Spacer(1, 10))
    else:
        story.append(
            Paragraph(
                "No anomalies detected.",
                styles["Normal"]
            )
        )

    story.append(PageBreak())

    # AI Analysis section
    story.append(
        Paragraph(
            "AI Analysis",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Overall System Health:</b> "
            f"{ai_summary.get('overall_system_health', 'N/A')}",
            styles["Normal"]
        )
    )

    story.append(Spacer(1, 15))

    sections = [
        ("Critical Issues", "critical_issues"),
        ("Performance Concerns", "performance_concerns"),
        ("Security Concerns", "security_concerns"),
        ("Possible Root Causes", "possible_root_causes"),
        ("Recommended Fixes", "recommended_fixes"),
        ("Prevention Tips", "prevention_tips")
    ]

    for heading, key in sections:

        story.append(
            Paragraph(
                heading,
                styles["Heading3"]
            )
        )

        items = ai_summary.get(key, [])

        if items:
            for item in items:
                story.append(
                    Paragraph(
                        f"• {item}",
                        styles["Normal"]
                    )
                )

                story.append(Spacer(1, 6))
        else:
            story.append(
                Paragraph(
                    "No data available.",
                    styles["Normal"]
                )
            )

        story.append(Spacer(1, 10))

    doc.build(story)

    return report_path
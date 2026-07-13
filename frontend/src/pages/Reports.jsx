import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiCpu,
  FiDownload,
  FiFileText,
  FiRefreshCw,
  FiShield,
  FiZap,
} from "react-icons/fi"

import api from "../services/api"

function Reports() {
  const [statistics, setStatistics] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [uploads, setUploads] = useState([])
  const [selectedUploadId, setSelectedUploadId] =
    useState("")

  const [filename, setFilename] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState("")

  const fetchReportData = useCallback(
    async (requestedUploadId = null) => {
      try {
        setLoading(true)
        setError("")

        const historyResponse = await api.get(
          "/uploads/history"
        )

        const uploadHistory =
          historyResponse.data?.uploads || []

        setUploads(uploadHistory)

        if (!uploadHistory.length) {
          setStatistics(null)
          setAnalysis(null)
          setSelectedUploadId("")
          setFilename("")

          localStorage.removeItem("currentUploadId")
          localStorage.removeItem("currentLogFile")

          return
        }

        const storedUploadId =
          localStorage.getItem("currentUploadId")

        const uploadId =
          requestedUploadId || storedUploadId

        let selectedUpload = uploadHistory.find(
          (upload) =>
            String(upload.id) === String(uploadId)
        )

        if (!selectedUpload) {
          selectedUpload = uploadHistory[0]
        }

        const currentId = String(selectedUpload.id)

        setSelectedUploadId(currentId)
        setFilename(selectedUpload.filename || "")

        localStorage.setItem(
          "currentUploadId",
          currentId
        )

        localStorage.setItem(
          "currentLogFile",
          selectedUpload.filename || ""
        )

        const [
          statisticsResponse,
          aiResponse,
        ] = await Promise.all([
          api.get(
            `/statistics/id/${selectedUpload.id}`
          ),

          api
            .get(
              `/ai-summary/id/${selectedUpload.id}`
            )
            .catch((err) => {
              console.error(
                "AI SUMMARY ERROR:",
                err
              )

              return null
            }),
        ])

        setStatistics(statisticsResponse.data)

        const aiData =
          aiResponse?.data?.ai_summary ||
          aiResponse?.data?.analysis ||
          aiResponse?.data ||
          null

        setAnalysis(aiData)
      } catch (err) {
        console.error("REPORT ERROR:", err)

        setStatistics(null)
        setAnalysis(null)

        const detail =
          err?.response?.data?.detail

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load report data."
        )
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchReportData()

    const handleUploadChanged = () => {
      const uploadId =
        localStorage.getItem("currentUploadId")

      fetchReportData(uploadId)
    }

    window.addEventListener(
      "currentUploadChanged",
      handleUploadChanged
    )

    return () => {
      window.removeEventListener(
        "currentUploadChanged",
        handleUploadChanged
      )
    }
  }, [fetchReportData])

  const handleUploadChange = async (event) => {
    const uploadId = event.target.value

    setSelectedUploadId(uploadId)

    localStorage.setItem(
      "currentUploadId",
      String(uploadId)
    )

    window.dispatchEvent(
      new Event("currentUploadChanged")
    )
  }

  const normalizeList = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === "string") return [value]

    return []
  }

  const criticalIssues = useMemo(
    () => normalizeList(analysis?.critical_issues),
    [analysis]
  )

  const performanceConcerns = useMemo(
    () =>
      normalizeList(
        analysis?.performance_concerns
      ),
    [analysis]
  )

  const securityConcerns = useMemo(
    () =>
      normalizeList(
        analysis?.security_concerns
      ),
    [analysis]
  )

  const rootCauses = useMemo(
    () =>
      normalizeList(
        analysis?.possible_root_causes
      ),
    [analysis]
  )

  const recommendedActions = useMemo(
    () =>
      normalizeList(
        analysis?.recommended_actions
      ),
    [analysis]
  )

  const totalLogs =
    statistics?.total_logs ?? 0

  const totalErrors =
    statistics?.total_errors ?? 0

  const totalWarnings =
    statistics?.total_warnings ?? 0

  const criticalErrors =
    statistics?.critical_errors ?? 0

  const errorRate =
    statistics?.error_rate_percent ?? 0

  const systemHealth =
    analysis?.overall_system_health ||
    analysis?.system_health ||
    "Not analyzed"

  const getHealthStyle = () => {
    const health =
      String(systemHealth).toLowerCase()

    if (
      health.includes("critical") ||
      health.includes("poor")
    ) {
      return {
        badge:
          "border-red-200 bg-red-50 text-red-700",
        icon: "bg-red-100 text-red-600",
      }
    }

    if (
      health.includes("degraded") ||
      health.includes("warning")
    ) {
      return {
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: "bg-amber-100 text-amber-600",
      }
    }

    if (
      health.includes("healthy") ||
      health.includes("good")
    ) {
      return {
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon:
          "bg-emerald-100 text-emerald-600",
      }
    }

    return {
      badge:
        "border-slate-200 bg-slate-50 text-slate-700",
      icon: "bg-slate-100 text-slate-600",
    }
  }

  const healthStyle = getHealthStyle()

  const downloadReport = async (reportType) => {
    if (!selectedUploadId) {
      setError(
        "Select an uploaded log file first."
      )

      return
    }

    try {
      setDownloading(reportType)
      setError("")

      const response = await api.get(
        `/report/${reportType}/id/${selectedUploadId}`,
        {
          responseType: "blob",
        }
      )

      const blob = new Blob([response.data], {
        type:
          reportType === "pdf"
            ? "application/pdf"
            : "text/csv",
      })

      const url =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement("a")

      const safeFilename = (
        filename || "log-report"
      )
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")

      link.href = url

      link.download =
        `${safeFilename}_report.${reportType}`

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(
        `${reportType.toUpperCase()} DOWNLOAD ERROR:`,
        err
      )

      setError(
        `Unable to download ${reportType.toUpperCase()} report.`
      )
    } finally {
      setDownloading("")
    }
  }

  const metricCards = [
    {
      title: "Total Logs",
      value: totalLogs,
      icon: FiFileText,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Errors",
      value: totalErrors,
      icon: FiAlertCircle,
      iconClass: "bg-red-50 text-red-600",
    },
    {
      title: "Warnings",
      value: totalWarnings,
      icon: FiAlertTriangle,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "Critical Events",
      value: criticalErrors,
      icon: FiZap,
      iconClass:
        "bg-violet-50 text-violet-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
            <FiBarChart2 className="animate-pulse" />
          </div>

          <h3 className="mt-5 font-semibold text-slate-900">
            Preparing your report
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Loading statistics and AI insights...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <FiBarChart2 />
            Intelligence Report
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Reports
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review system metrics, AI findings,
            and recommended actions.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 lg:flex-row xl:w-auto">
          {uploads.length > 0 && (
            <select
              value={selectedUploadId}
              onChange={handleUploadChange}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none lg:w-64"
            >
              {uploads.map((upload) => (
                <option
                  key={upload.id}
                  value={upload.id}
                >
                  {upload.filename}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() =>
              fetchReportData(selectedUploadId)
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={() => downloadReport("csv")}
            disabled={downloading !== ""}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold disabled:opacity-60"
          >
            <FiDownload />

            {downloading === "csv"
              ? "Preparing..."
              : "Download CSV"}
          </button>

          <button
            onClick={() => downloadReport("pdf")}
            disabled={downloading !== ""}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <FiDownload />

            {downloading === "pdf"
              ? "Preparing..."
              : "Download PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {selectedUploadId && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${healthStyle.icon}`}
                >
                  <FiActivity />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Current Analysis Report
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {filename}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <FiCpu />
                    AI-assisted log analysis
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  System Health
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${healthStyle.badge}`}
                >
                  {systemHealth}
                </span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => {
              const Icon = card.icon

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${card.iconClass}`}
                    >
                      <Icon />
                    </div>

                    <span className="text-2xl font-bold">
                      {card.value}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold">
                    {card.title}
                  </p>
                </div>
              )
            })}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">
                  Error Rate Overview
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Percentage of error events.
                </p>
              </div>

              <span className="text-3xl font-bold">
                {errorRate}%
              </span>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{
                  width: `${Math.min(
                    Number(errorRate) || 0,
                    100
                  )}%`,
                }}
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ReportSection
              title="Critical Issues"
              icon={FiAlertTriangle}
              items={criticalIssues}
              emptyText="No critical issues detected."
            />

            <ReportSection
              title="Performance Concerns"
              icon={FiActivity}
              items={performanceConcerns}
              emptyText="No performance concerns detected."
            />

            <ReportSection
              title="Security Concerns"
              icon={FiShield}
              items={securityConcerns}
              emptyText="No security concerns detected."
            />

            <ReportSection
              title="Possible Root Causes"
              icon={FiCpu}
              items={rootCauses}
              emptyText="No root causes identified."
            />
          </section>

          <ReportSection
            title="Recommended Actions"
            icon={FiCheckCircle}
            items={recommendedActions}
            emptyText="No AI recommendations available."
          />
        </div>
      )}
    </div>
  )
}

function ReportSection({
  title,
  icon: Icon,
  items,
  emptyText,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
            <Icon />
          </div>

          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>
        </div>
      </div>

      <div className="p-5">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${String(item)}-${index}`}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {index + 1}
                </span>

                <p className="text-sm leading-6 text-slate-700">
                  {String(item)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {emptyText}
          </p>
        )}
      </div>
    </div>
  )
}

export default Reports
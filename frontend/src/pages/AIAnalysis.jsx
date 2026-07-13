import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiCpu,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiZap,
} from "react-icons/fi"

import api from "../services/api"


function AIAnalysis() {
  const [analysis, setAnalysis] = useState(null)
  const [uploads, setUploads] = useState([])
  const [selectedUploadId, setSelectedUploadId] =
    useState("")
  const [filename, setFilename] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  const fetchAnalysis = useCallback(
    async (uploadId = null) => {
      try {
        setLoading(true)
        setError("")

        const historyResponse = await api.get(
          "/uploads/history"
        )

        const uploadHistory =
          historyResponse.data?.uploads || []

        setUploads(uploadHistory)

        if (uploadHistory.length === 0) {
          setAnalysis(null)
          setFilename("")
          setSelectedUploadId("")

          localStorage.removeItem(
            "currentUploadId"
          )

          localStorage.removeItem(
            "currentLogFile"
          )

          return
        }

        let selectedUpload = null

        if (uploadId) {
          selectedUpload = uploadHistory.find(
            (upload) =>
              String(upload.id) ===
              String(uploadId)
          )
        }

        if (!selectedUpload) {
          const savedUploadId =
            localStorage.getItem(
              "currentUploadId"
            )

          selectedUpload = uploadHistory.find(
            (upload) =>
              String(upload.id) ===
              String(savedUploadId)
          )
        }

        if (!selectedUpload) {
          selectedUpload = uploadHistory[0]
        }

        const selectedId = String(
          selectedUpload.id
        )

        setSelectedUploadId(selectedId)

        setFilename(
          selectedUpload.filename
        )

        localStorage.setItem(
          "currentUploadId",
          selectedId
        )

        localStorage.setItem(
          "currentLogFile",
          selectedUpload.filename
        )

        const response = await api.get(
          `/ai-summary/id/${selectedId}`
        )


        const data =
          response.data?.ai_summary ||
          response.data?.analysis ||
          response.data

        setAnalysis(data)
      } catch (err) {
        console.error(
          "AI ANALYSIS ERROR:",
          err
        )

        console.error(
          "BACKEND ERROR:",
          JSON.stringify(
            err?.response?.data,
            null,
            2
          )
        )

        setAnalysis(null)

        const detail =
          err?.response?.data?.detail

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load AI analysis."
        )
      } finally {
        setLoading(false)
      }
    },
    []
  )


  useEffect(() => {
    fetchAnalysis()

    const handleUploadChanged = () => {
      const uploadId =
        localStorage.getItem(
          "currentUploadId"
        )

      fetchAnalysis(uploadId)
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
  }, [fetchAnalysis])


  const handleUploadChange = async (event) => {
    const uploadId = event.target.value

    const selectedUpload = uploads.find(
      (upload) =>
        String(upload.id) ===
        String(uploadId)
    )

    setSelectedUploadId(uploadId)

    localStorage.setItem(
      "currentUploadId",
      String(uploadId)
    )

    if (selectedUpload) {
      localStorage.setItem(
        "currentLogFile",
        selectedUpload.filename
      )
    }

    window.dispatchEvent(
      new Event("currentUploadChanged")
    )

    await fetchAnalysis(uploadId)
  }


  const normalizeList = (value) => {
    if (!value) {
      return []
    }

    if (Array.isArray(value)) {
      return value
    }

    if (typeof value === "string") {
      return [value]
    }

    return []
  }


  const criticalIssues = normalizeList(
    analysis?.critical_issues
  )

  const performanceConcerns = normalizeList(
    analysis?.performance_concerns
  )

  const securityConcerns = normalizeList(
    analysis?.security_concerns
  )

  const possibleRootCauses = normalizeList(
    analysis?.possible_root_causes
  )

  const recommendedActions = normalizeList(
    analysis?.recommended_actions
  )


  const systemHealth =
    analysis?.overall_system_health ||
    analysis?.system_health ||
    "Unknown"


  const getHealthClasses = () => {
    const health = String(
      systemHealth
    ).toLowerCase()

    if (
      health.includes("critical") ||
      health.includes("poor")
    ) {
      return {
        badge:
          "border-red-200 bg-red-50 text-red-700",
        icon:
          "bg-red-100 text-red-600",
      }
    }

    if (
      health.includes("degraded") ||
      health.includes("warning")
    ) {
      return {
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon:
          "bg-amber-100 text-amber-600",
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
      icon:
        "bg-slate-100 text-slate-600",
    }
  }


  const healthClasses = getHealthClasses()


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-2xl bg-indigo-100" />

            <div className="absolute inset-0 grid place-items-center text-2xl text-indigo-600">
              <FiCpu className="animate-pulse" />
            </div>
          </div>

          <h3 className="mt-5 font-semibold text-slate-900">
            AI is analyzing your logs
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Detecting issues, risks, and possible root
            causes...
          </p>
        </div>
      </div>
    )
  }


  return (
    <div className="w-full">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            AI Analysis
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            AI-powered system health insights, anomaly
            detection, and recommendations.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          {uploads.length > 0 && (
            <select
              value={selectedUploadId}
              onChange={handleUploadChange}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-64"
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
            type="button"
            onClick={() =>
              fetchAnalysis(selectedUploadId)
            }
            disabled={
              loading ||
              !selectedUploadId
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw />
            Run Analysis
          </button>
        </div>
      </div>


      {filename && (
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
            Analyzing Upload
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
            {filename}
          </p>
        </div>
      )}


      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0 text-xl" />

          <div>
            <strong className="font-semibold">
              Analysis failed
            </strong>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}


      {!analysis && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
            <FiCpu />
          </div>

          <h3 className="mt-5 text-lg font-semibold text-slate-900">
            No AI analysis available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Upload a log file first, then run AI analysis.
          </p>
        </div>
      )}


      {analysis && (
        <>
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl ${healthClasses.icon}`}
                >
                  <FiActivity />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Overall System Health
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {systemHealth}
                  </h2>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${healthClasses.badge}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                AI Assessment
              </span>
            </div>
          </div>


          <div className="mb-6 grid gap-5 md:grid-cols-3">
            <InsightCard
              title="Critical Issues"
              description="High-priority problems detected"
              count={criticalIssues.length}
              icon={FiAlertTriangle}
              iconClasses="bg-red-50 text-red-600"
              borderClasses="border-red-100"
            />

            <InsightCard
              title="Performance Concerns"
              description="System performance risks"
              count={performanceConcerns.length}
              icon={FiZap}
              iconClasses="bg-amber-50 text-amber-600"
              borderClasses="border-amber-100"
            />

            <InsightCard
              title="Security Concerns"
              description="Potential security risks detected"
              count={securityConcerns.length}
              icon={FiShield}
              iconClasses="bg-violet-50 text-violet-600"
              borderClasses="border-violet-100"
            />
          </div>


          <div className="grid gap-6 xl:grid-cols-2">
            <AnalysisCard
              title="Critical Issues"
              subtitle="Issues requiring immediate attention"
              icon={FiAlertTriangle}
              items={criticalIssues}
              emptyText="No critical issues detected."
              iconClasses="bg-red-50 text-red-600"
              bulletClasses="bg-red-500"
            />

            <AnalysisCard
              title="Performance Concerns"
              subtitle="Detected performance degradation"
              icon={FiActivity}
              items={performanceConcerns}
              emptyText="No performance concerns detected."
              iconClasses="bg-amber-50 text-amber-600"
              bulletClasses="bg-amber-500"
            />

            <AnalysisCard
              title="Security Concerns"
              subtitle="Potential threats and vulnerabilities"
              icon={FiShield}
              items={securityConcerns}
              emptyText="No security concerns detected."
              iconClasses="bg-violet-50 text-violet-600"
              bulletClasses="bg-violet-500"
            />

            <AnalysisCard
              title="Possible Root Causes"
              subtitle="AI-generated cause investigation"
              icon={FiSearch}
              items={possibleRootCauses}
              emptyText="No root causes identified."
              iconClasses="bg-blue-50 text-blue-600"
              bulletClasses="bg-blue-500"
            />
          </div>


          <div className="mt-6 rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                  <FiCheckCircle />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Recommended Actions
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    AI-generated steps to improve system
                    stability
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {recommendedActions.length > 0 ? (
                <div className="space-y-3">
                  {recommendedActions.map(
                    (item, index) => (
                      <div
                        key={`${String(item)}-${index}`}
                        className="flex items-start gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
                      >
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                          {index + 1}
                        </div>

                        <p className="text-sm leading-6 text-slate-700">
                          {String(item)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No recommendations available.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}


function InsightCard({
  title,
  description,
  count,
  icon: Icon,
  iconClasses,
  borderClasses,
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${borderClasses}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${iconClasses}`}
        >
          <Icon />
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {count}
        </span>
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  )
}


function AnalysisCard({
  title,
  subtitle,
  icon: Icon,
  items,
  emptyText,
  iconClasses,
  bulletClasses,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${iconClasses}`}
          >
            <Icon />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              {title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          </div>
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
                <span
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${bulletClasses}`}
                />

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


export default AIAnalysis
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import { Link } from "react-router-dom"

import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiClock,
  FiCpu,
  FiFileText,
  FiRefreshCw,
  FiUploadCloud,
  FiZap,
} from "react-icons/fi"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import api from "../services/api"


function Dashboard() {
  const [statistics, setStatistics] =
    useState(null)

  const [chartData, setChartData] =
    useState([])

  const [hourlyData, setHourlyData] =
    useState([])

  const [uploads, setUploads] =
    useState([])

  const [recentCriticalLogs, setRecentCriticalLogs] =
    useState([])

  const [aiSummary, setAiSummary] =
    useState(null)

  const [selectedUploadId, setSelectedUploadId] =
    useState("")

  const [filename, setFilename] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [hasUploads, setHasUploads] =
    useState(true)

  const [error, setError] =
    useState("")


  const fetchDashboardData = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError("")

        const historyResponse = await api.get(
          "/uploads/history"
        )

        const uploadHistory =
          historyResponse.data?.uploads || []

        setUploads(uploadHistory)


        if (uploadHistory.length === 0) {
          setStatistics(null)
          setChartData([])
          setHourlyData([])
          setRecentCriticalLogs([])
          setAiSummary(null)
          setFilename("")
          setSelectedUploadId("")
          setHasUploads(false)

          localStorage.removeItem(
            "currentUploadId"
          )

          localStorage.removeItem(
            "currentLogFile"
          )

          return
        }


        let currentUploadId =
          localStorage.getItem(
            "currentUploadId"
          )


        let selectedUpload =
          uploadHistory.find(
            (upload) =>
              String(upload.id) ===
              String(currentUploadId)
          )


        if (!selectedUpload) {
          selectedUpload = uploadHistory[0]

          currentUploadId = String(
            selectedUpload.id
          )

          localStorage.setItem(
            "currentUploadId",
            currentUploadId
          )

          localStorage.setItem(
            "currentLogFile",
            selectedUpload.filename
          )
        }


        const selectedId = String(
          selectedUpload.id
        )


        setSelectedUploadId(selectedId)

        setFilename(
          selectedUpload.filename
        )

        setHasUploads(true)


        const [
          statisticsResponse,
          chartsResponse,
          analysisResponse,
          aiResponse,
        ] = await Promise.all([
          api.get(
            `/statistics/id/${selectedId}`
          ),

          api.get(
            `/charts/id/${selectedId}`
          ),

          api.get(
            `/analyze-uploaded/id/${selectedId}`
          ),

          api
            .get(
              `/ai-summary/id/${selectedId}`
            )
            .catch(() => null),
        ])


        setStatistics(
          statisticsResponse.data
        )


        const charts =
          chartsResponse.data?.charts ||
          chartsResponse.data ||
          {}


        const distribution =
          charts.log_distribution ||
          charts.level_distribution ||
          charts.distribution ||
          []


        const hourly =
          charts.hourly_activity ||
          charts.hourly_data ||
          charts.activity_by_hour ||
          []


        setChartData(
          Array.isArray(distribution)
            ? distribution
            : []
        )


        setHourlyData(
          Array.isArray(hourly)
            ? hourly
            : []
        )


        const logs = Array.isArray(
          analysisResponse.data?.logs
        )
          ? analysisResponse.data.logs
          : []


        const criticalLogs = logs
          .filter((log) => {
            const level = String(
              log?.level || ""
            ).toUpperCase()

            return (
              level === "ERROR" ||
              level === "CRITICAL"
            )
          })
          .sort((firstLog, secondLog) =>
            String(
              secondLog?.timestamp || ""
            ).localeCompare(
              String(
                firstLog?.timestamp || ""
              )
            )
          )
          .slice(0, 5)


        setRecentCriticalLogs(
          criticalLogs
        )


        const aiData =
          aiResponse?.data?.ai_summary ||
          aiResponse?.data?.analysis ||
          aiResponse?.data ||
          null


        setAiSummary(aiData)
      } catch (err) {
        if (
          err?.response?.status === 404
        ) {
          setStatistics(null)
          setChartData([])
          setHourlyData([])
          setRecentCriticalLogs([])
          setAiSummary(null)
          setHasUploads(false)

          localStorage.removeItem(
            "currentUploadId"
          )

          localStorage.removeItem(
            "currentLogFile"
          )

          return
        }


        const detail =
          err?.response?.data?.detail


        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load dashboard data."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    []
  )


  useEffect(() => {
    fetchDashboardData()


    const handleUploadChange = () => {
      fetchDashboardData()
    }


    window.addEventListener(
      "currentUploadChanged",
      handleUploadChange
    )


    return () => {
      window.removeEventListener(
        "currentUploadChanged",
        handleUploadChange
      )
    }
  }, [fetchDashboardData])


  const recentUploads = useMemo(
    () => uploads.slice(0, 5),
    [uploads]
  )


  const aiOverview = useMemo(() => {
    if (!aiSummary) {
      return ""
    }


    return (
      aiSummary.summary ||
      aiSummary.executive_summary ||
      aiSummary.overview ||
      aiSummary.system_summary ||
      ""
    )
  }, [aiSummary])


  const systemHealth =
    aiSummary?.overall_system_health ||
    aiSummary?.system_health ||
    "Not analyzed"


  const getHealthClasses = () => {
    const health = String(
      systemHealth
    ).toLowerCase()


    if (
      health.includes("critical") ||
      health.includes("poor")
    ) {
      return (
        "border-red-200 " +
        "bg-red-50 text-red-700"
      )
    }


    if (
      health.includes("warning") ||
      health.includes("degraded")
    ) {
      return (
        "border-amber-200 " +
        "bg-amber-50 text-amber-700"
      )
    }


    if (
      health.includes("healthy") ||
      health.includes("good")
    ) {
      return (
        "border-emerald-200 " +
        "bg-emerald-50 text-emerald-700"
      )
    }


    return (
      "border-slate-200 " +
      "bg-slate-50 text-slate-700"
    )
  }


  const cards = [
    {
      title: "Total Logs",
      value:
        statistics?.total_logs ?? 0,
      icon: FiFileText,
      iconStyle:
        "bg-blue-50 text-blue-600",
    },

    {
      title: "Total Errors",
      value:
        statistics?.total_errors ?? 0,
      icon: FiAlertCircle,
      iconStyle:
        "bg-red-50 text-red-500",
    },

    {
      title: "Warnings",
      value:
        statistics?.total_warnings ?? 0,
      icon: FiAlertTriangle,
      iconStyle:
        "bg-amber-50 text-amber-500",
    },

    {
      title: "Critical Events",
      value:
        statistics?.critical_errors ?? 0,
      icon: FiZap,
      iconStyle:
        "bg-violet-50 text-violet-600",
    },

    {
      title: "Error Rate",
      value:
        `${
          statistics
            ?.error_rate_percent ?? 0
        }%`,
      icon: FiActivity,
      iconStyle:
        "bg-emerald-50 text-emerald-600",
    },
  ]


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading your workspace...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Preparing system intelligence
          </p>
        </div>
      </div>
    )
  }


  if (!hasUploads) {
    return (
      <div className="w-full">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your secure log intelligence workspace.
          </p>
        </div>


        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm sm:px-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-indigo-50 text-4xl text-indigo-600">
            <FiUploadCloud />
          </div>


          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Workspace ready
          </p>


          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            Upload your first log file
          </h2>


          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
            Upload a system log to start
            parsing events, detecting anomalies,
            and generating AI intelligence.
          </p>


          <Link
            to="/upload"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white"
          >
            <FiUploadCloud />

            Upload log file

            <FiArrowRight />
          </Link>
        </section>
      </div>
    )
  }


  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            System intelligence for your selected log.
          </p>

          {filename && (
            <p className="mt-2 text-xs font-semibold text-indigo-600">
              Analyzing: {filename}
            </p>
          )}
        </div>


        <button
          type="button"
          onClick={() =>
            fetchDashboardData(true)
          }
          disabled={refreshing}
          className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-indigo-50 disabled:opacity-60"
        >
          <FiRefreshCw
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>


      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0 text-xl" />

          <span>{error}</span>
        </div>
      )}


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="flex min-h-[125px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl ${card.iconStyle}`}
              >
                <Icon />
              </div>


              <div>
                <span className="text-xs font-medium text-slate-500">
                  {card.title}
                </span>

                <strong className="mt-1 block text-2xl font-bold text-slate-900">
                  {card.value}
                </strong>
              </div>
            </div>
          )
        })}
      </div>


      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Log Distribution"
          subtitle="Events grouped by severity level"
        >
          {chartData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="level" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#5b5cf0"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState />
          )}
        </ChartCard>


        <ChartCard
          title="Hourly Activity"
          subtitle="Log events generated by hour"
        >
          {hourlyData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={hourlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="hour" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#5b5cf0"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState />
          )}
        </ChartCard>
      </div>


      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
              <FiCpu />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                AI System Summary
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                AI-assisted system intelligence
              </p>
            </div>
          </div>


          <div className="mt-5">
            <span
              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getHealthClasses()}`}
            >
              System Health: {systemHealth}
            </span>


            <p className="mt-4 text-sm leading-7 text-slate-600">
              {aiOverview ||
                "AI analysis is available on the AI Analysis page."}
            </p>


            <Link
              to="/ai-analysis"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
            >
              View full AI analysis

              <FiArrowRight />
            </Link>
          </div>
        </section>


        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-xl text-red-600">
              <FiAlertCircle />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Recent Critical Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest error and critical events
              </p>
            </div>
          </div>


          <div className="mt-5 space-y-3">
            {recentCriticalLogs.length > 0 ? (
              recentCriticalLogs.map(
                (log, index) => (
                  <div
                    key={`${log?.timestamp}-${index}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                        {log?.level}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <FiClock />

                        {log?.timestamp || "-"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {log?.message || "-"}
                    </p>
                  </div>
                )
              )
            ) : (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                No error or critical activity detected.
              </div>
            )}
          </div>
        </section>
      </div>


      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="font-bold text-slate-900">
            Recent Uploads
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest files in your secure workspace
          </p>
        </div>


        <div className="mt-5 divide-y divide-slate-100">
          {recentUploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FiFileText />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {upload.filename}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Upload ID #{upload.id}
                  </p>
                </div>
              </div>


              {String(upload.id) ===
                selectedUploadId && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}


function ChartCard({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1.5 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="h-[320px] w-full min-w-0">
        {children}
      </div>
    </section>
  )
}


function ChartEmptyState() {
  return (
    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50">
      <p className="text-sm text-slate-500">
        No chart data available.
      </p>
    </div>
  )
}


export default Dashboard
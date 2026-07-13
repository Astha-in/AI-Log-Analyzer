import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  FiAlertCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiDownload,
  FiFileText,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi"

import api from "../services/api"

const PAGE_SIZE = 10

function ParsedLogs() {
  const [logs, setLogs] = useState([])
  const [uploads, setUploads] = useState([])
  const [selectedUploadId, setSelectedUploadId] =
    useState("")
  const [filename, setFilename] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloadingPDF, setDownloadingPDF] =
    useState(false)
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] =
    useState("ALL")
  const [sortField, setSortField] =
    useState("timestamp")
  const [sortDirection, setSortDirection] =
    useState("asc")
  const [currentPage, setCurrentPage] =
    useState(1)

  const fetchLogs = useCallback(
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
          setLogs([])
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
        setFilename(selectedUpload.filename)

        localStorage.setItem(
          "currentUploadId",
          selectedId
        )

        localStorage.setItem(
          "currentLogFile",
          selectedUpload.filename
        )

        const response = await api.get(
          `/analyze-uploaded/id/${selectedId}`
        )

        const parsedLogs = Array.isArray(
          response.data?.logs
        )
          ? response.data.logs
          : []

        setLogs(parsedLogs)
        setCurrentPage(1)
      } catch (err) {
        console.error(
          "PARSED LOGS ERROR:",
          err
        )

        setLogs([])

        const detail =
          err?.response?.data?.detail

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load parsed logs."
        )
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleUploadChange = async (event) => {
    const uploadId = event.target.value

    const selectedUpload = uploads.find(
      (upload) =>
        String(upload.id) ===
        String(uploadId)
    )

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

    setSelectedUploadId(uploadId)
    setSearch("")
    setLevelFilter("ALL")
    setCurrentPage(1)

    await fetchLogs(uploadId)
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const level = String(
        log?.level || ""
      ).toUpperCase()

      const searchableText = Object.values(
        log || {}
      )
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        searchableText.includes(
          search.toLowerCase()
        )

      const matchesLevel =
        levelFilter === "ALL" ||
        level === levelFilter

      return matchesSearch && matchesLevel
    })
  }, [logs, search, levelFilter])

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort(
      (firstLog, secondLog) => {
        const firstValue = String(
          firstLog?.[sortField] || ""
        ).toLowerCase()

        const secondValue = String(
          secondLog?.[sortField] || ""
        ).toLowerCase()

        const result = firstValue.localeCompare(
          secondValue
        )

        return sortDirection === "asc"
          ? result
          : -result
      }
    )
  }, [
    filteredLogs,
    sortField,
    sortDirection,
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(sortedLogs.length / PAGE_SIZE)
  )

  const paginatedLogs = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PAGE_SIZE

    return sortedLogs.slice(
      startIndex,
      startIndex + PAGE_SIZE
    )
  }, [sortedLogs, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, levelFilter])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(
        (currentDirection) =>
          currentDirection === "asc"
            ? "desc"
            : "asc"
      )

      return
    }

    setSortField(field)
    setSortDirection("asc")
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <FiChevronDown className="text-slate-300" />
      )
    }

    return sortDirection === "asc" ? (
      <FiChevronUp className="text-indigo-600" />
    ) : (
      <FiChevronDown className="text-indigo-600" />
    )
  }

  const getLevelClasses = (levelValue) => {
    const level = String(
      levelValue || ""
    ).toUpperCase()

    if (level === "ERROR") {
      return "border-red-200 bg-red-50 text-red-700"
    }

    if (level === "CRITICAL") {
      return "border-purple-200 bg-purple-50 text-purple-700"
    }

    if (
      level === "WARNING" ||
      level === "WARN"
    ) {
      return "border-amber-200 bg-amber-50 text-amber-700"
    }

    if (level === "DEBUG") {
      return "border-slate-200 bg-slate-100 text-slate-700"
    }

    return "border-blue-200 bg-blue-50 text-blue-700"
  }

  const downloadCSV = () => {
    if (sortedLogs.length === 0) {
      return
    }

    const headers = [
      "Timestamp",
      "Level",
      "Module",
      "Service",
      "Error Code",
      "Message",
    ]

    const escapeCSV = (value) => {
      const text = String(value ?? "")

      return `"${text.replace(/"/g, '""')}"`
    }

    const rows = sortedLogs.map((log) => [
      log?.timestamp || "",
      log?.level || "",
      log?.module || "",
      log?.service || "",
      log?.error_code || "",
      log?.message || "",
    ])

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.map(escapeCSV).join(",")
      )
      .join("\n")

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    const safeFilename = (
      filename || "parsed-logs"
    )
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")

    link.href = url
    link.download =
      `${safeFilename}-parsed-logs.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const downloadPDF = async () => {
    if (!selectedUploadId) {
      setError(
        "Select an uploaded log file first."
      )
      return
    }

    try {
      setDownloadingPDF(true)
      setError("")

      const response = await api.get(
        `/report/pdf/id/${selectedUploadId}`,
        {
          responseType: "blob",
        }
      )

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      )

      const url =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement("a")

      const safeFilename = (
        filename || "parsed-logs"
      )
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")

      link.href = url
      link.download =
        `${safeFilename}-parsed-logs-report.pdf`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(
        "PDF DOWNLOAD ERROR:",
        err
      )

      setError(
        "Unable to download PDF report."
      )
    } finally {
      setDownloadingPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading parsed logs...
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
            Parsed Logs
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Explore structured events extracted
            from your uploaded log files.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={downloadCSV}
            disabled={sortedLogs.length === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiDownload />
            Export CSV
          </button>

          <button
            type="button"
            onClick={downloadPDF}
            disabled={
              !selectedUploadId ||
              downloadingPDF
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiDownload />

            {downloadingPDF
              ? "Preparing PDF..."
              : "Export PDF"}
          </button>

          <button
            type="button"
            onClick={() =>
              fetchLogs(selectedUploadId)
            }
            disabled={!selectedUploadId}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
              <FiFileText />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Current Log File
              </p>

              <h2 className="mt-1 truncate font-semibold text-slate-900">
                {filename || "No uploaded file"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {logs.length} parsed log events
              </p>
            </div>
          </div>

          {uploads.length > 0 && (
            <div className="w-full md:w-72">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Select Upload
              </label>

              <select
                value={selectedUploadId}
                onChange={handleUploadChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search message, service, module, error code..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(event) =>
            setLevelFilter(event.target.value)
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        >
          <option value="ALL">All Levels</option>
          <option value="INFO">Info</option>
          <option value="DEBUG">Debug</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #
                </th>

                <SortableHeader
                  label="Timestamp"
                  field="timestamp"
                  onSort={handleSort}
                >
                  <SortIcon field="timestamp" />
                </SortableHeader>

                <SortableHeader
                  label="Level"
                  field="level"
                  onSort={handleSort}
                >
                  <SortIcon field="level" />
                </SortableHeader>

                <SortableHeader
                  label="Module"
                  field="module"
                  onSort={handleSort}
                >
                  <SortIcon field="module" />
                </SortableHeader>

                <SortableHeader
                  label="Service"
                  field="service"
                  onSort={handleSort}
                >
                  <SortIcon field="service" />
                </SortableHeader>

                <SortableHeader
                  label="Error Code"
                  field="error_code"
                  onSort={handleSort}
                >
                  <SortIcon field="error_code" />
                </SortableHeader>

                <SortableHeader
                  label="Message"
                  field="message"
                  onSort={handleSort}
                >
                  <SortIcon field="message" />
                </SortableHeader>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map(
                (log, index) => {
                  const level =
                    log?.level || "INFO"

                  const rowNumber =
                    (currentPage - 1) *
                      PAGE_SIZE +
                    index +
                    1

                  return (
                    <tr
                      key={`${log?.timestamp}-${rowNumber}`}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {rowNumber}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-600">
                        {log?.timestamp || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getLevelClasses(
                            level
                          )}`}
                        >
                          {String(
                            level
                          ).toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {log?.module || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {log?.service || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {log?.error_code ? (
                          <span className="inline-flex rounded-lg bg-red-50 px-2.5 py-1 font-mono text-xs font-semibold text-red-700">
                            {log.error_code}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">
                            —
                          </span>
                        )}
                      </td>

                      <td className="max-w-md px-5 py-4 text-sm leading-6 text-slate-700">
                        {log?.message || "-"}
                      </td>
                    </tr>
                  )
                }
              )}
            </tbody>
          </table>
        </div>

        {sortedLogs.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
              <FiFileText />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No parsed logs found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload a log file or change your
              search filters.
            </p>
          </div>
        )}

        {sortedLogs.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(currentPage - 1) *
                  PAGE_SIZE +
                  1}
              </span>
              {" - "}
              <span className="font-semibold text-slate-700">
                {Math.min(
                  currentPage * PAGE_SIZE,
                  sortedLogs.length
                )}
              </span>
              {" of "}
              <span className="font-semibold text-slate-700">
                {sortedLogs.length}
              </span>
              {" logs"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (page) => page - 1
                  )
                }
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>

              <span className="px-3 text-sm font-medium text-slate-600">
                Page {currentPage} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) => page + 1
                  )
                }
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SortableHeader({
  label,
  field,
  onSort,
  children,
}) {
  return (
    <th className="px-5 py-4">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-indigo-600"
      >
        {label}
        {children}
      </button>
    </th>
  )
}

export default ParsedLogs
import {
  useCallback,
  useEffect,
  useState,
} from "react"

import { useDropzone } from "react-dropzone"

import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi"

import api from "../services/api"


function UploadLogs() {
  const [selectedFile, setSelectedFile] =
    useState(null)

  const [uploading, setUploading] =
    useState(false)

  const [result, setResult] =
    useState(null)

  const [error, setError] =
    useState("")

  const [history, setHistory] =
    useState([])

  const [historyLoading, setHistoryLoading] =
    useState(true)

  const [deleteTarget, setDeleteTarget] =
    useState(null)

  const [deleting, setDeleting] =
    useState(false)


  const loadUploadHistory = useCallback(
    async () => {
      try {
        setHistoryLoading(true)

        const response = await api.get(
          "/uploads/history"
        )

        setHistory(
          response.data?.uploads || []
        )
      } catch (err) {
        console.error(
          "UPLOAD HISTORY ERROR:",
          err
        )
      } finally {
        setHistoryLoading(false)
      }
    },
    []
  )


  useEffect(() => {
    loadUploadHistory()
  }, [loadUploadHistory])


  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]

      if (!file) {
        return
      }

      setSelectedFile(file)
      setResult(null)
      setError("")
    },
    []
  )


  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "text/plain": [
        ".log",
        ".txt",
      ],
    },
    onDropRejected: (rejections) => {
      const rejection = rejections[0]

      const fileTooLarge =
        rejection?.errors?.some(
          (item) =>
            item.code === "file-too-large"
        )

      if (fileTooLarge) {
        setError(
          "File exceeds the 10 MB upload limit."
        )
      } else {
        setError(
          "Only .log and .txt files are allowed."
        )
      }

      setSelectedFile(null)
      setResult(null)
    },
  })


  const handleUpload = async () => {
    if (!selectedFile) {
      setError(
        "Please select a log file first."
      )

      return
    }

    try {
      setUploading(true)
      setError("")
      setResult(null)

      const formData = new FormData()

      formData.append(
        "file",
        selectedFile
      )

      const uploadResponse = await api.post(
        "/upload",
        formData
      )

      const uploadedFilename =
        uploadResponse.data?.filename ||
        selectedFile.name

      const totalLogs =
        uploadResponse.data?.total_logs ??
        uploadResponse.data?.logs?.length ??
        0

      localStorage.setItem(
        "currentLogFile",
        uploadedFilename
      )

      setResult({
        filename: uploadedFilename,
        total_logs: totalLogs,
      })

      setSelectedFile(null)

      await loadUploadHistory()
    } catch (err) {
      console.error(
        "UPLOAD ERROR:",
        err
      )

      const detail =
        err?.response?.data?.detail

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .join(", ")
        )
      } else if (
        typeof detail === "string"
      ) {
        setError(detail)
      } else {
        setError(
          `Upload failed${
            err?.response?.status
              ? ` (${err.response.status})`
              : ""
          }.`
        )
      }
    } finally {
      setUploading(false)
    }
  }


  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      setDeleting(true)
      setError("")

      await api.delete(
        `/uploads/${deleteTarget.id}`
      )

      const currentFile =
        localStorage.getItem(
          "currentLogFile"
        )

      if (
        currentFile ===
        deleteTarget.filename
      ) {
        localStorage.removeItem(
          "currentLogFile"
        )
      }

      setDeleteTarget(null)

      await loadUploadHistory()
    } catch (err) {
      console.error(
        "DELETE UPLOAD ERROR:",
        err
      )

      setError(
        err?.response?.data?.detail ||
        "Failed to delete upload."
      )
    } finally {
      setDeleting(false)
    }
  }


  const removeFile = () => {
    setSelectedFile(null)
    setResult(null)
    setError("")
  }


  const formatFileSize = (bytes) => {
    const size = Number(bytes || 0)

    if (size < 1024) {
      return `${size} B`
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(2)} KB`
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(2)} MB`
  }


  const formatDate = (date) => {
    if (!date) {
      return "Unknown"
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(date)
    )
  }


  const getStatusClasses = (status) => {
    if (status === "processed") {
      return (
        "border-emerald-200 " +
        "bg-emerald-50 " +
        "text-emerald-700"
      )
    }

    if (status === "failed") {
      return (
        "border-red-200 " +
        "bg-red-50 " +
        "text-red-700"
      )
    }

    return (
      "border-amber-200 " +
      "bg-amber-50 " +
      "text-amber-700"
    )
  }


  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Upload Logs
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Upload and manage your system log files.
        </p>
      </div>


      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div
          {...getRootProps()}
          className={[
            "group cursor-pointer rounded-2xl",
            "border-2 border-dashed",
            "px-6 py-12 text-center",
            "transition-all duration-200",
            "sm:px-10 sm:py-16",
            isDragActive
              ? "border-indigo-500 bg-indigo-50"
              : (
                "border-slate-300 bg-slate-50/70 " +
                "hover:border-indigo-400 " +
                "hover:bg-indigo-50/40"
              ),
          ].join(" ")}
        >
          <input {...getInputProps()} />

          <div
            className={[
              "mx-auto grid h-16 w-16",
              "place-items-center rounded-2xl",
              "text-3xl transition-all",
              isDragActive
                ? (
                  "scale-105 bg-indigo-100 " +
                  "text-indigo-600"
                )
                : (
                  "bg-indigo-50 text-indigo-600 " +
                  "group-hover:scale-105 " +
                  "group-hover:bg-indigo-100"
                ),
            ].join(" ")}
          >
            <FiUploadCloud />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            {isDragActive
              ? "Drop your log file here"
              : "Drag & drop your log file"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            or click to browse from your computer
          </p>

          <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
            .log or .txt · Maximum 10 MB
          </span>
        </div>


        {selectedFile && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-xl text-blue-600">
                <FiFileText />
              </div>

              <div className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-slate-900">
                  {selectedFile.name}
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  {formatFileSize(
                    selectedFile.size
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                removeFile()
              }}
              className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-slate-200 text-lg text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              aria-label="Remove selected file"
            >
              <FiX />
            </button>
          </div>
        )}


        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />

            <span>{error}</span>
          </div>
        )}


        <button
          type="button"
          onClick={handleUpload}
          disabled={
            !selectedFile ||
            uploading
          }
          className={[
            "mt-6 flex h-12 w-full",
            "items-center justify-center gap-2",
            "rounded-xl px-5",
            "text-sm font-semibold text-white",
            "transition-all duration-200",
            !selectedFile || uploading
              ? "cursor-not-allowed bg-slate-300"
              : (
                "cursor-pointer bg-indigo-600 " +
                "shadow-lg shadow-indigo-600/20 " +
                "hover:-translate-y-0.5 " +
                "hover:bg-indigo-700"
              ),
          ].join(" ")}
        >
          {uploading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Uploading & Analyzing...
            </>
          ) : (
            <>
              <FiUploadCloud className="text-lg" />
              Upload & Analyze
            </>
          )}
        </button>


        {result && (
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-xl text-emerald-600">
              <FiCheckCircle />
            </div>

            <div>
              <strong className="block text-sm font-semibold text-emerald-900">
                Upload successful
              </strong>

              <p className="mt-1 text-sm leading-6 text-emerald-700">
                <span className="font-semibold">
                  {result.total_logs}
                </span>{" "}
                logs parsed from{" "}
                <span className="font-semibold">
                  {result.filename}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>


      <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">
            Upload History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your recent log files and processing status.
          </p>
        </div>


        {historyLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : history.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
              <FiClock />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No upload history
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Uploaded log files will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((upload) => (
              <div
                key={upload.id}
                className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
                    <FiFileText />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {upload.filename}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
                      <span>
                        {formatFileSize(
                          upload.file_size
                        )}
                      </span>

                      <span>
                        {upload.total_logs} logs
                      </span>

                      <span>
                        {formatDate(
                          upload.created_at
                        )}
                      </span>
                    </div>
                  </div>
                </div>


                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={[
                      "inline-flex rounded-full border",
                      "px-3 py-1 text-xs font-semibold",
                      getStatusClasses(
                        upload.status
                      ),
                    ].join(" ")}
                  >
                    {upload.status}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget(upload)
                    }
                    className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${upload.filename}`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-xl text-red-600">
              <FiTrash2 />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Delete log file?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget.filename}
              </span>{" "}
              and its generated reports.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Delete permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default UploadLogs
import {
  useCallback,
  useEffect,
  useState,
} from "react"

import { useNavigate } from "react-router-dom"

import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiLogOut,
  FiMail,
  FiRefreshCw,
  FiServer,
  FiSettings,
  FiShield,
  FiUser,
} from "react-icons/fi"

import api from "../services/api"
import { useAuth } from "../context/AuthContext"


function Settings() {
  const navigate = useNavigate()

  const {
    user,
    logout,
    fetchCurrentUser,
  } = useAuth()

  const [backendStatus, setBackendStatus] =
    useState("checking")

  const [currentFile, setCurrentFile] =
    useState("")

  const [currentUploadId, setCurrentUploadId] =
    useState("")

  const [uploadCount, setUploadCount] =
    useState(0)

  const [loadingWorkspace, setLoadingWorkspace] =
    useState(true)

  const [loggingOut, setLoggingOut] =
    useState(false)

  const [error, setError] =
    useState("")


  const loadWorkspace = useCallback(
    async () => {
      try {
        setLoadingWorkspace(true)
        setError("")

        const savedUploadId =
          localStorage.getItem(
            "currentUploadId"
          ) || ""

        const savedFilename =
          localStorage.getItem(
            "currentLogFile"
          ) || ""

        setCurrentUploadId(savedUploadId)
        setCurrentFile(savedFilename)

        const historyResponse = await api.get(
          "/uploads/history"
        )

        const uploads =
          historyResponse.data?.uploads || []

        setUploadCount(uploads.length)

        if (uploads.length === 0) {
          setCurrentUploadId("")
          setCurrentFile("")

          localStorage.removeItem(
            "currentUploadId"
          )

          localStorage.removeItem(
            "currentLogFile"
          )

          return
        }

        const selectedUpload = uploads.find(
          (upload) =>
            String(upload.id) ===
            String(savedUploadId)
        )

        if (!selectedUpload) {
          const latestUpload = uploads[0]

          const uploadId = String(
            latestUpload.id
          )

          setCurrentUploadId(uploadId)

          setCurrentFile(
            latestUpload.filename
          )

          localStorage.setItem(
            "currentUploadId",
            uploadId
          )

          localStorage.setItem(
            "currentLogFile",
            latestUpload.filename
          )

          window.dispatchEvent(
            new Event(
              "currentUploadChanged"
            )
          )
        }
      } catch (err) {
        const detail =
          err?.response?.data?.detail

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load workspace information."
        )
      } finally {
        setLoadingWorkspace(false)
      }
    },
    []
  )


  const checkBackend = useCallback(
    async () => {
      try {
        setBackendStatus("checking")

        await api.get("/health")

        setBackendStatus("online")
      } catch {
        setBackendStatus("offline")
      }
    },
    []
  )


  useEffect(() => {
    loadWorkspace()
    checkBackend()

    const handleUploadChange = () => {
      loadWorkspace()
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
  }, [
    loadWorkspace,
    checkBackend,
  ])


  const handleRefreshAccount = async () => {
    try {
      setError("")

      await fetchCurrentUser()
      await loadWorkspace()
      await checkBackend()
    } catch {
      setError(
        "Unable to refresh account information."
      )
    }
  }


  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      setError("")

      await logout()

      localStorage.removeItem(
        "currentUploadId"
      )

      localStorage.removeItem(
        "currentLogFile"
      )

     

      navigate("/login", {
        replace: true,
      })
    } catch {
      setError(
        "Unable to complete logout."
      )
    } finally {
      setLoggingOut(false)
    }
  }


  const getInitials = () => {
    const name = user?.name || "User"

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }


  const formatCreatedAt = () => {
    if (!user?.created_at) {
      return "Not available"
    }

    const date = new Date(
      user.created_at
    )

    if (Number.isNaN(date.getTime())) {
      return "Not available"
    }

    return date.toLocaleString()
  }


  return (
    <div className="w-full pb-10">
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <FiSettings />
            Account & Workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review your account, active analysis
            workspace, API connection, and secure
            session.
          </p>
        </div>


        <button
          type="button"
          onClick={handleRefreshAccount}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <FiRefreshCw />
          Refresh Status
        </button>
      </div>


      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0 text-xl" />

          <span>{error}</span>
        </div>
      )}


      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatusCard
          icon={FiServer}
          title="Backend API"
          value={
            backendStatus === "online"
              ? "Connected"
              : backendStatus === "offline"
                ? "Disconnected"
                : "Checking..."
          }
          description="FastAPI service connection"
          tone={
            backendStatus === "online"
              ? "green"
              : backendStatus === "offline"
                ? "red"
                : "blue"
          }
        />


        <StatusCard
          icon={FiFileText}
          title="Active Log File"
          value={
            currentFile ||
            "No file selected"
          }
          description={
            currentUploadId
              ? `Upload ID ${currentUploadId}`
              : "No active analysis context"
          }
          tone="blue"
        />


        <StatusCard
          icon={FiActivity}
          title="Workspace Uploads"
          value={
            loadingWorkspace
              ? "Loading..."
              : String(uploadCount)
          }
          description="Files available to your account"
          tone="purple"
        />
      </div>


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                <FiUser />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Account Information
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Authenticated user information
                  returned by the secure API.
                </p>
              </div>
            </div>
          </div>


          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-600/20">
                {getInitials()}
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-950">
                  {user?.name || "User"}
                </h3>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {user?.email ||
                    "Email unavailable"}
                </p>
              </div>
            </div>


            <div className="mt-5 divide-y divide-slate-100">
              <InformationRow
                icon={FiUser}
                label="Name"
                value={user?.name || "Unavailable"}
              />

              <InformationRow
                icon={FiMail}
                label="Email Address"
                value={
                  user?.email || "Unavailable"
                }
              />

              <InformationRow
                icon={FiShield}
                label="Account Role"
                value={
                  user?.role || "user"
                }
              />

              <InformationRow
                icon={FiClock}
                label="Account Created"
                value={formatCreatedAt()}
              />
            </div>
          </div>
        </section>


        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                <FiShield />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Session & Security
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Review the current authenticated
                  session and securely sign out.
                </p>
              </div>
            </div>
          </div>


          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-emerald-600" />

              <div>
                <h3 className="text-sm font-semibold text-emerald-900">
                  Authenticated Session
                </h3>

                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  Your workspace is protected by
                  access and refresh token
                  authentication.
                </p>
              </div>
            </div>


            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Session Account
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                {user?.email || "Unavailable"}
              </p>
            </div>


            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-semibold text-slate-900">
                End Current Session
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Signing out removes authentication
                tokens and clears the active upload
                context from this browser.
              </p>


              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loggingOut ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <FiLogOut />
                    Sign Out Securely
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>


      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={[
                "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl",
                backendStatus === "online"
                  ? "bg-emerald-50 text-emerald-600"
                  : backendStatus === "offline"
                    ? "bg-red-50 text-red-600"
                    : "bg-blue-50 text-blue-600",
              ].join(" ")}
            >
              <FiServer />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-slate-950">
                Backend Connection
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Connection status is verified using
                the FastAPI health endpoint.
              </p>
            </div>
          </div>


          <button
            type="button"
            onClick={checkBackend}
            disabled={
              backendStatus === "checking"
            }
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={
                backendStatus === "checking"
                  ? "animate-spin"
                  : ""
              }
            />

            Check Connection
          </button>
        </div>
      </section>
    </div>
  )
}


function StatusCard({
  icon: Icon,
  title,
  value,
  description,
  tone,
}) {
  const toneClasses = {
    green:
      "bg-emerald-50 text-emerald-600",
    red:
      "bg-red-50 text-red-600",
    blue:
      "bg-blue-50 text-blue-600",
    purple:
      "bg-violet-50 text-violet-600",
  }


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${
            toneClasses[tone] ||
            toneClasses.blue
          }`}
        >
          <Icon />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <h3 className="mt-1 truncate font-bold text-slate-950">
            {value}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}


function InformationRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 py-4">
      <FiActivity className="hidden" />

      <Icon className="mt-0.5 shrink-0 text-lg text-slate-400" />

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  )
}


export default Settings
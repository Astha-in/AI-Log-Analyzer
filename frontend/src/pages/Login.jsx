import { useEffect, useState } from "react"
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom"
import {
  FiActivity,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi"

import { useAuth } from "../context/AuthContext"

function Login() {
  const {
    login,
    isAuthenticated,
    loading: authLoading,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const rememberedEmail =
      localStorage.getItem("rememberedEmail")

    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-indigo-400" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError("Enter your email and password.")
      return
    }

    try {
      setSubmitting(true)
      setError("")

      await login(
        email.trim().toLowerCase(),
        password
      )

      if (rememberMe) {
        localStorage.setItem(
          "rememberedEmail",
          email.trim().toLowerCase()
        )
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      const destination =
        location.state?.from?.pathname || "/"

      navigate(destination, {
        replace: true,
      })
    } catch (err) {
      console.error("LOGIN ERROR:", err)

      setError(
        err?.response?.data?.detail ||
          "Unable to sign in. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* BRAND PANEL */}
      <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-950 to-violet-600/20" />

        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[32rem] w-[32rem] rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500 text-2xl text-white shadow-xl shadow-indigo-500/20">
              <FiActivity />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                LogSense AI
              </h1>

              <p className="text-xs font-medium text-slate-400">
                Intelligent Log Analyzer
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-indigo-200 backdrop-blur">
            <FiShield />
            AI-powered operational intelligence
          </div>

          <h2 className="text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">
            Turn system logs into
            <span className="block bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              actionable intelligence.
            </span>
          </h2>

          <p className="mt-6 max-w-lg text-base leading-8 text-slate-400">
            Detect anomalies, investigate critical events,
            and generate AI-assisted system insights from a
            single secure workspace.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs text-slate-500">
          <FiLock />
          Secure analysis workspace
        </div>
      </section>

      {/* LOGIN PANEL */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-100 blur-3xl lg:hidden" />

        <div className="relative w-full max-w-md">
          {/* MOBILE BRAND */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-xl text-white shadow-lg shadow-indigo-600/20">
              <FiActivity />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                LogSense AI
              </h1>

              <p className="text-xs text-slate-500">
                Intelligent Log Analyzer
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                Secure access
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to access your log analysis workspace.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setError("")
                    }}
                    placeholder="admin@logsense.ai"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setError("")
                    }}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER */}
              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                  />

                  Remember me
                </label>

                <button
                  type="button"
                  className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Forgot password?
                </button>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />
                  <span>{error}</span>
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className={[
                  "flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition-all",
                  submitting
                    ? "cursor-not-allowed bg-indigo-400"
                    : "bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl",
                ].join(" ")}
              >
                {submitting ? (
                  <span className="flex items-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying account...
                  </span>
                ) : (
                  "Sign in securely"
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-xs leading-5 text-slate-400">
                Protected access to the LogSense AI analysis
                environment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
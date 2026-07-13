import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
} from "react-icons/fi"

import api from "../services/api"

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError("")

      await api.post("/auth/register", form)

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Account created successfully. Sign in to continue.",
        },
      })
    } catch (err) {
      const detail = err?.response?.data?.detail

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .join(", ")
        )
      } else {
        setError(
          detail ||
            "Unable to create your account."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-xl shadow-indigo-600/20">
            <FiActivity />
          </div>

          <div>
            <p className="text-xl font-bold text-white">
              LogSense AI
            </p>

            <p className="text-sm text-slate-400">
              Intelligent Log Analysis
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <span className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Secure observability
          </span>

          <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
            Turn system noise into
            <span className="block text-indigo-400">
              actionable intelligence.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            Analyze logs, detect anomalies, uncover root
            causes, and generate AI-powered operational
            insights from one secure workspace.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Private user-owned log storage",
              "AI-powered anomaly intelligence",
              "Secure downloadable analysis reports",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm font-medium text-slate-300"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <FiCheck />
                </span>

                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          Secure AI-powered system intelligence.
        </p>
      </section>

      <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-xl text-white">
                <FiActivity />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  LogSense AI
                </p>

                <p className="text-xs text-slate-500">
                  Intelligent Log Analysis
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-600">
              CREATE YOUR WORKSPACE
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Start analyzing your system logs in a secure,
              private workspace.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
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

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use 8+ characters with uppercase, lowercase,
                a number, and a special character.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default Register
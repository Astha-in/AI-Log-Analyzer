import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiUser,
} from "react-icons/fi"

import { useAuth } from "../context/AuthContext"
import api from "../services/api"

function Navbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false)

  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      )
    }
  }, [])

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout request failed:", error)
    } finally {
      logout()
      navigate("/login", {
        replace: true,
      })
    }
  }

  const displayName =
    user?.name || "Administrator"

  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-[88px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
  type="button"
  onClick={onMenuClick}
  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
  aria-label="Toggle navigation menu"
>
  <FiMenu />
</button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
              AI Log Analyzer
            </h1>

            <p className="mt-1 hidden text-sm text-slate-500 sm:block">
              Monitor, analyze and detect system anomalies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden xl:block">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              placeholder="Search logs..."
              className="h-12 w-72 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            type="button"
            className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-lg text-slate-600 transition hover:bg-slate-50 sm:h-12 sm:w-12"
            aria-label="Notifications"
          >
            <FiBell />

            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div
            ref={dropdownRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen((current) => !current)
              }
              className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50"
              aria-expanded={profileOpen}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-bold text-white shadow-sm">
                {initials}
              </div>

              <div className="hidden min-w-0 text-left md:block">
                <p className="max-w-32 truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>

                <p className="mt-0.5 text-xs capitalize text-slate-500">
                  {user?.role || "user"}
                </p>
              </div>

              <FiChevronDown
                className={`hidden text-slate-400 transition-transform md:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                <div className="border-b border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user?.email}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      navigate("/settings")
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiUser className="text-lg" />
                    Account settings
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <FiLogOut className="text-lg" />
                    Sign out securely
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
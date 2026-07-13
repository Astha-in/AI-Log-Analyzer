import { NavLink } from "react-router-dom"

import {
  FiGrid,
  FiUploadCloud,
  FiFileText,
  FiCpu,
  FiDownload,
  FiSettings,
  FiActivity,
} from "react-icons/fi"

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: FiGrid,
  },
  {
    name: "Upload Logs",
    path: "/upload",
    icon: FiUploadCloud,
  },
  {
    name: "Parsed Logs",
    path: "/parsed-logs",
    icon: FiFileText,
  },
  {
    name: "AI Analysis",
    path: "/ai-analysis",
    icon: FiCpu,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FiDownload,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: FiSettings,
  },
]

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-[#111827] px-5 py-7 text-white lg:flex">
      {/* BRAND */}
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-xl text-white shadow-lg shadow-indigo-950/20">
          <FiActivity />
        </div>

        <div>
          <h1 className="text-lg font-bold text-white">
            LogSense AI
          </h1>

          <p className="mt-0.5 text-xs text-slate-400">
            Intelligent Monitoring
          </p>
        </div>
      </div>

      {/* WORKSPACE LABEL */}
      <p className="mb-3 mt-10 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Workspace
      </p>

      {/* MENU */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-950/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="text-lg" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* STATUS */}
      <div className="mt-auto border-t border-white/10 pt-5">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />

          <div>
            <strong className="block text-xs font-semibold text-white">
              System Online
            </strong>

            <span className="mt-0.5 block text-[10px] text-slate-400">
              All services operational
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
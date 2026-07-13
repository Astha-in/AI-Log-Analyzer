import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024

      setIsMobile(mobile)

      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen, isMobile])

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* DARK MOBILE OVERLAY */}
      {isMobile && sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 cursor-pointer bg-slate-950/60 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-[260px]",
          "transform transition-transform duration-300 ease-in-out",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={[
          "min-h-screen transition-[padding] duration-300 ease-in-out",
          !isMobile && sidebarOpen
            ? "lg:pl-[260px]"
            : "pl-0",
        ].join(" ")}
      >
        <Navbar onMenuClick={toggleSidebar} />

        <main className="w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
import React, { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useSupabase } from "../contexts/SupabaseContext"
import Sidebar from "./Sidebar"
import { FiMenu, FiLogOut } from "react-icons/fi"

const Layout = () => {
  const { signOut, user } = useSupabase()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                    fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <Sidebar closeSidebar={() => isMobile && setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                title="Sign out"
              >
                <FiLogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default Layout

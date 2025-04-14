import React, { useEffect, useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useSupabase } from "./contexts/SupabaseContext"

// Pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import TodoList from "./pages/TodoList"

// Components
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  const { session, isLoading } = useSupabase()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!session ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!session ? <Register /> : <Navigate to="/" />}
      />

      <Route element={<ProtectedRoute session={session} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lists/:listId" element={<TodoList />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSupabase } from "../contexts/SupabaseContext"
import { FiList, FiCheckCircle } from "react-icons/fi"

const Dashboard = () => {
  const { getTodoLists, getTodos } = useSupabase()
  const [lists, setLists] = useState([])
  const [recentTodos, setRecentTodos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load todo lists
        const { data: listsData, error: listsError } = await getTodoLists()
        if (listsError) throw listsError
        setLists(listsData || [])

        // Load recent todos from all lists
        if (listsData && listsData.length > 0) {
          const recentTodosPromises = listsData
            .slice(0, 3)
            .map((list) => getTodos(list.id))
          const recentTodosResults = await Promise.all(recentTodosPromises)

          const allRecentTodos = recentTodosResults
            .flatMap((result) => result.data || [])
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)

          setRecentTodos(allRecentTodos)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Todo Lists</h2>
          <p className="text-3xl font-bold text-blue-600">{lists.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Recent Todos</h2>
          <p className="text-3xl font-bold text-green-600">
            {recentTodos.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Completed</h2>
          <p className="text-3xl font-bold text-purple-600">
            {recentTodos.filter((todo) => todo.is_completed).length}
          </p>
        </div>
      </div>

      {/* Todo Lists */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Todo Lists</h2>
        {lists.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">
              You don't have any todo lists yet.
            </p>
            <p className="text-sm text-gray-400">
              Create a new list from the sidebar to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lists.map((list) => (
              <Link
                key={list.id}
                to={`/lists/${list.id}`}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <FiList className="text-blue-500 mr-2" size={20} />
                  <h3 className="text-lg font-medium">{list.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Created on {new Date(list.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Todos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Todos</h2>
        {recentTodos.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No recent todos found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentTodos.map((todo) => (
                <li key={todo.id} className="p-4 hover:bg-gray-50">
                  <Link to={`/lists/${todo.list_id}`} className="block">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 ${
                          todo.is_completed ? "text-green-500" : "text-gray-400"
                        }`}
                      >
                        <FiCheckCircle size={18} />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            todo.is_completed
                              ? "line-through text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {todo.description}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(todo.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

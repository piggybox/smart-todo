import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSupabase } from "../contexts/SupabaseContext"
import {
  FiCheckCircle,
  FiCircle,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiCalendar,
  FiFlag,
} from "react-icons/fi"

const TodoList = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const {
    getTodoLists,
    updateTodoList,
    deleteTodoList,
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  } = useSupabase()

  const [list, setList] = useState(null)
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [isEditingListName, setIsEditingListName] = useState(false)

  // New todo form state
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [newTodoDescription, setNewTodoDescription] = useState("")
  const [newTodoDueDate, setNewTodoDueDate] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState(0)

  // Edit todo form state
  const [editTodoTitle, setEditTodoTitle] = useState("")
  const [editTodoDescription, setEditTodoDescription] = useState("")
  const [editTodoDueDate, setEditTodoDueDate] = useState("")
  const [editTodoPriority, setEditTodoPriority] = useState(0)

  // Edit list name state
  const [editListName, setEditListName] = useState("")

  useEffect(() => {
    loadData()
  }, [listId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load list details
      const { data: listsData, error: listsError } = await getTodoLists()
      if (listsError) throw listsError

      const currentList = listsData?.find((l) => l.id.toString() === listId)
      if (!currentList) {
        navigate("/")
        return
      }

      setList(currentList)
      setEditListName(currentList.name)

      // Load todos for this list
      const { data: todosData, error: todosError } = await getTodos(listId)
      if (todosError) throw todosError

      setTodos(todosData || [])
    } catch (error) {
      console.error("Error loading list data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return

    try {
      const newTodo = {
        title: newTodoTitle.trim(),
        description: newTodoDescription.trim(),
        due_date: newTodoDueDate || null,
        priority: newTodoPriority,
        list_id: parseInt(listId),
      }

      const { error } = await createTodo(newTodo)
      if (error) throw error

      // Reset form and reload todos
      setNewTodoTitle("")
      setNewTodoDescription("")
      setNewTodoDueDate("")
      setNewTodoPriority(0)
      setIsAddingTodo(false)
      loadData()
    } catch (error) {
      console.error("Error adding todo:", error)
    }
  }

  const handleToggleTodo = async (todo) => {
    try {
      const { error } = await updateTodo(todo.id, {
        is_completed: !todo.is_completed,
      })
      if (error) throw error

      // Update local state
      setTodos(
        todos.map((t) =>
          t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t
        )
      )
    } catch (error) {
      console.error("Error toggling todo:", error)
    }
  }

  const handleEditTodo = async (e) => {
    e.preventDefault()
    if (!editTodoTitle.trim() || !editingTodoId) return

    try {
      const updatedTodo = {
        title: editTodoTitle.trim(),
        description: editTodoDescription.trim(),
        due_date: editTodoDueDate || null,
        priority: editTodoPriority,
      }

      const { error } = await updateTodo(editingTodoId, updatedTodo)
      if (error) throw error

      // Reset form and reload todos
      setEditingTodoId(null)
      loadData()
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  const handleDeleteTodo = async (id) => {
    if (!confirm("Are you sure you want to delete this todo?")) return

    try {
      const { error } = await deleteTodo(id)
      if (error) throw error

      // Update local state
      setTodos(todos.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const handleUpdateListName = async () => {
    if (!editListName.trim() || editListName === list.name) {
      setIsEditingListName(false)
      return
    }

    try {
      const { error } = await updateTodoList(listId, {
        name: editListName.trim(),
      })
      if (error) throw error

      // Update local state
      setList({ ...list, name: editListName.trim() })
      setIsEditingListName(false)
    } catch (error) {
      console.error("Error updating list name:", error)
    }
  }

  const handleDeleteList = async () => {
    if (
      !confirm("Are you sure you want to delete this list and all its todos?")
    )
      return

    try {
      const { error } = await deleteTodoList(listId)
      if (error) throw error

      navigate("/")
    } catch (error) {
      console.error("Error deleting list:", error)
    }
  }

  const startEditTodo = (todo) => {
    setEditingTodoId(todo.id)
    setEditTodoTitle(todo.title)
    setEditTodoDescription(todo.description || "")
    setEditTodoDueDate(
      todo.due_date ? new Date(todo.due_date).toISOString().split("T")[0] : ""
    )
    setEditTodoPriority(todo.priority || 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">List not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* List Header */}
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate("/")}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none"
          title="Back to Dashboard"
        >
          <FiArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        {isEditingListName ? (
          <div className="flex-1 flex">
            <input
              type="text"
              value={editListName}
              onChange={(e) => setEditListName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleUpdateListName}
              className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none"
            >
              Save
            </button>
          </div>
        ) : (
          <h1
            className="text-2xl font-bold flex-1 cursor-pointer hover:text-blue-600"
            onClick={() => setIsEditingListName(true)}
          >
            {list.name}
          </h1>
        )}

        <button
          onClick={handleDeleteList}
          className="ml-4 p-2 text-red-500 hover:bg-red-100 rounded-full focus:outline-none"
          title="Delete List"
        >
          <FiTrash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Add Todo Button */}
      <button
        onClick={() => setIsAddingTodo(!isAddingTodo)}
        className="mb-6 flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
      >
        <FiPlus className="mr-2" />
        {isAddingTodo ? "Cancel" : "Add Todo"}
      </button>

      {/* Add Todo Form */}
      {isAddingTodo && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add New Todo</h2>
          <form onSubmit={handleAddTodo}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="title"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter todo title"
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                value={newTodoDescription}
                onChange={(e) => setNewTodoDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description (optional)"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="dueDate"
                >
                  Due Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiCalendar className="text-gray-500" />
                  </div>
                  <input
                    id="dueDate"
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                    className="w-full pl-10 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="priority"
                >
                  Priority
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiFlag className="text-gray-500" />
                  </div>
                  <select
                    id="priority"
                    value={newTodoPriority}
                    onChange={(e) =>
                      setNewTodoPriority(parseInt(e.target.value))
                    }
                    className="w-full pl-10 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
              >
                Add Todo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todos List */}
      {todos.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">No todos in this list yet.</p>
          <p className="text-sm text-gray-400">
            Add a new todo to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {todos.map((todo) => (
              <li key={todo.id} className="p-4 hover:bg-gray-50">
                {editingTodoId === todo.id ? (
                  <form onSubmit={handleEditTodo} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editTodoTitle}
                        onChange={(e) => setEditTodoTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Description
                      </label>
                      <textarea
                        value={editTodoDescription}
                        onChange={(e) => setEditTodoDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={editTodoDueDate}
                          onChange={(e) => setEditTodoDueDate(e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Priority
                        </label>
                        <select
                          value={editTodoPriority}
                          onChange={(e) =>
                            setEditTodoPriority(parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="0">Low</option>
                          <option value="1">Medium</option>
                          <option value="2">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingTodoId(null)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start">
                    <button
                      onClick={() => handleToggleTodo(todo)}
                      className={`mt-1 mr-3 flex-shrink-0 ${
                        todo.is_completed ? "text-green-500" : "text-gray-400"
                      } hover:text-green-600 focus:outline-none`}
                    >
                      {todo.is_completed ? (
                        <FiCheckCircle size={20} />
                      ) : (
                        <FiCircle size={20} />
                      )}
                    </button>

                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          todo.is_completed
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {todo.title}
                      </h3>

                      {todo.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {todo.description}
                        </p>
                      )}

                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        {todo.due_date && (
                          <div className="flex items-center mr-4">
                            <FiCalendar className="mr-1" />
                            {new Date(todo.due_date).toLocaleDateString()}
                          </div>
                        )}

                        <div className="flex items-center">
                          <FiFlag className="mr-1" />
                          {todo.priority === 0 && "Low"}
                          {todo.priority === 1 && "Medium"}
                          {todo.priority === 2 && "High"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center ml-4">
                      <button
                        onClick={() => startEditTodo(todo)}
                        className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none"
                        title="Edit Todo"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1 ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                        title="Delete Todo"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default TodoList

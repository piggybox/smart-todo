import React, { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useSupabase } from "../contexts/SupabaseContext"
import {
  FiFolder,
  FiList,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronRight,
} from "react-icons/fi"

const Sidebar = ({ closeSidebar }) => {
  const {
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    getTodoLists,
    createTodoList,
    deleteTodoList,
  } = useSupabase()
  const [folders, setFolders] = useState([])
  const [lists, setLists] = useState([])
  const [newFolderName, setNewFolderName] = useState("")
  const [newListName, setNewListName] = useState("")
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [isAddingList, setIsAddingList] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [editingFolderName, setEditingFolderName] = useState("")
  const navigate = useNavigate()
  const { listId } = useParams()

  // Fetch folders and lists
  useEffect(() => {
    loadFolders()
    loadLists()
  }, [])

  const loadFolders = async () => {
    try {
      const { data, error } = await getFolders()
      if (error) throw error
      setFolders(data || [])
    } catch (error) {
      console.error("Error loading folders:", error)
    }
  }

  const loadLists = async () => {
    try {
      const { data, error } = await getTodoLists()
      if (error) throw error
      setLists(data || [])
    } catch (error) {
      console.error("Error loading lists:", error)
    }
  }

  const handleAddFolder = async (e) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      const { error } = await createFolder(newFolderName.trim())
      if (error) throw error
      setNewFolderName("")
      setIsAddingFolder(false)
      loadFolders()
    } catch (error) {
      console.error("Error creating folder:", error)
    }
  }

  const handleEditFolder = async (id) => {
    if (!editingFolderName.trim()) return

    try {
      const { error } = await updateFolder(id, editingFolderName.trim())
      if (error) throw error
      setEditingFolder(null)
      setEditingFolderName("")
      loadFolders()
    } catch (error) {
      console.error("Error updating folder:", error)
    }
  }

  const handleDeleteFolder = async (id) => {
    if (
      !confirm("Are you sure you want to delete this folder and all its lists?")
    )
      return

    try {
      const { error } = await deleteFolder(id)
      if (error) throw error
      loadFolders()
      loadLists()
    } catch (error) {
      console.error("Error deleting folder:", error)
    }
  }

  const handleAddList = async (e) => {
    e.preventDefault()
    if (!newListName.trim()) return

    try {
      const { error } = await createTodoList(newListName.trim())
      if (error) throw error
      setNewListName("")
      setIsAddingList(false)
      loadLists()
    } catch (error) {
      console.error("Error creating list:", error)
    }
  }

  const handleDeleteList = async (id) => {
    if (
      !confirm("Are you sure you want to delete this list and all its todos?")
    )
      return

    try {
      const { error } = await deleteTodoList(id)
      if (error) throw error
      loadLists()
      if (listId === id.toString()) {
        navigate("/")
      }
    } catch (error) {
      console.error("Error deleting list:", error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Smart Todo</h1>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Folders Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Folders
            </h2>
            <button
              onClick={() => setIsAddingFolder(!isAddingFolder)}
              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
              title="Add Folder"
            >
              <FiPlus className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {isAddingFolder && (
            <form onSubmit={handleAddFolder} className="mb-2">
              <div className="flex">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 px-2 py-1 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-blue-500 text-white text-sm rounded-r hover:bg-blue-600 focus:outline-none"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <ul className="space-y-1">
            {folders.map((folder) => (
              <li key={folder.id} className="group">
                {editingFolder === folder.id ? (
                  <div className="flex">
                    <input
                      type="text"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditFolder(folder.id)}
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded-r hover:bg-blue-600 focus:outline-none"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100">
                    <div className="flex items-center">
                      <FiFolder className="mr-2 text-blue-500" />
                      <span className="text-sm">{folder.name}</span>
                    </div>
                    <div className="hidden group-hover:flex items-center">
                      <button
                        onClick={() => {
                          setEditingFolder(folder.id)
                          setEditingFolderName(folder.name)
                        }}
                        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                        title="Edit Folder"
                      >
                        <FiEdit2 className="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                        title="Delete Folder"
                      >
                        <FiTrash2 className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Lists Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Lists
            </h2>
            <button
              onClick={() => setIsAddingList(!isAddingList)}
              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
              title="Add List"
            >
              <FiPlus className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {isAddingList && (
            <form onSubmit={handleAddList} className="mb-2">
              <div className="flex">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name"
                  className="flex-1 px-2 py-1 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-blue-500 text-white text-sm rounded-r hover:bg-blue-600 focus:outline-none"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <ul className="space-y-1">
            {lists.map((list) => (
              <li key={list.id} className="group">
                <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100">
                  <Link
                    to={`/lists/${list.id}`}
                    className="flex items-center flex-1"
                    onClick={closeSidebar}
                  >
                    <FiList className="mr-2 text-green-500" />
                    <span className="text-sm">{list.name}</span>
                  </Link>
                  <div className="hidden group-hover:flex items-center">
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                      title="Delete List"
                    >
                      <FiTrash2 className="h-3 w-3 text-gray-600" />
                    </button>
                    <Link
                      to={`/lists/${list.id}`}
                      className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                      onClick={closeSidebar}
                      title="Open List"
                    >
                      <FiChevronRight className="h-3 w-3 text-gray-600" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

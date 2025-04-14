import React, { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Please check your .env file.")
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Create context
const SupabaseContext = createContext()

export function useSupabase() {
  return useContext(SupabaseContext)
}

export function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auth functions
  const signUp = async (email, password) => {
    return supabase.auth.signUp({ email, password })
  }

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return supabase.auth.signOut()
  }

  // Data access functions
  const getFolders = async () => {
    return supabase.from("folders").select("*").order("name")
  }

  const createFolder = async (name) => {
    return supabase.from("folders").insert({ name })
  }

  const updateFolder = async (id, name) => {
    return supabase.from("folders").update({ name }).eq("id", id)
  }

  const deleteFolder = async (id) => {
    return supabase.from("folders").delete().eq("id", id)
  }

  const getTodoLists = async (folderId = null) => {
    let query = supabase.from("todo_lists").select("*")

    if (folderId) {
      query = query.eq("folder_id", folderId)
    }

    return query.order("name")
  }

  const createTodoList = async (name, folderId = null) => {
    return supabase.from("todo_lists").insert({ name, folder_id: folderId })
  }

  const updateTodoList = async (id, data) => {
    return supabase.from("todo_lists").update(data).eq("id", id)
  }

  const deleteTodoList = async (id) => {
    return supabase.from("todo_lists").delete().eq("id", id)
  }

  const getTodos = async (listId) => {
    return supabase
      .from("todos")
      .select("*")
      .eq("list_id", listId)
      .order("priority", { ascending: false })
      .order("created_at")
  }

  const createTodo = async (data) => {
    return supabase.from("todos").insert(data)
  }

  const updateTodo = async (id, data) => {
    return supabase.from("todos").update(data).eq("id", id)
  }

  const deleteTodo = async (id) => {
    return supabase.from("todos").delete().eq("id", id)
  }

  const value = {
    supabase,
    session,
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    getTodoLists,
    createTodoList,
    updateTodoList,
    deleteTodoList,
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

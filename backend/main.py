from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials. Please check your .env file.")

supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI(title="Smart Todo API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False
    due_date: Optional[str] = None
    priority: Optional[int] = 0

class TodoCreate(TodoBase):
    pass

class Todo(TodoBase):
    id: int
    list_id: int
    user_id: str

    class Config:
        orm_mode = True

class TodoListBase(BaseModel):
    name: str
    folder_id: Optional[int] = None

class TodoListCreate(TodoListBase):
    pass

class TodoList(TodoListBase):
    id: int
    user_id: str

    class Config:
        orm_mode = True

class FolderBase(BaseModel):
    name: str

class FolderCreate(FolderBase):
    pass

class Folder(FolderBase):
    id: int
    user_id: str

    class Config:
        orm_mode = True

# Helper functions
async def get_current_user(token: str) -> str:
    try:
        # Verify token with Supabase
        user = supabase.auth.get_user(token)
        return user.id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Routes
@app.get("/")
async def read_root():
    return {"message": "Welcome to Smart Todo API"}

# Todo Lists endpoints
@app.get("/lists", response_model=List[TodoList])
async def get_todo_lists(user_id: str = Depends(get_current_user)):
    response = supabase.table("todo_lists").select("*").eq("user_id", user_id).execute()
    return response.data

@app.post("/lists", response_model=TodoList, status_code=status.HTTP_201_CREATED)
async def create_todo_list(todo_list: TodoListCreate, user_id: str = Depends(get_current_user)):
    new_list = {**todo_list.dict(), "user_id": user_id}
    response = supabase.table("todo_lists").insert(new_list).execute()
    return response.data[0]

@app.put("/lists/{list_id}", response_model=TodoList)
async def update_todo_list(list_id: int, todo_list: TodoListCreate, user_id: str = Depends(get_current_user)):
    # Check if list exists and belongs to user
    list_check = supabase.table("todo_lists").select("*").eq("id", list_id).eq("user_id", user_id).execute()
    if not list_check.data:
        raise HTTPException(status_code=404, detail="Todo list not found")
    
    updated_list = todo_list.dict()
    response = supabase.table("todo_lists").update(updated_list).eq("id", list_id).execute()
    return response.data[0]

@app.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo_list(list_id: int, user_id: str = Depends(get_current_user)):
    # Check if list exists and belongs to user
    list_check = supabase.table("todo_lists").select("*").eq("id", list_id).eq("user_id", user_id).execute()
    if not list_check.data:
        raise HTTPException(status_code=404, detail="Todo list not found")
    
    supabase.table("todo_lists").delete().eq("id", list_id).execute()
    return None

# Todos endpoints
@app.get("/lists/{list_id}/todos", response_model=List[Todo])
async def get_todos(list_id: int, user_id: str = Depends(get_current_user)):
    # Check if list exists and belongs to user
    list_check = supabase.table("todo_lists").select("*").eq("id", list_id).eq("user_id", user_id).execute()
    if not list_check.data:
        raise HTTPException(status_code=404, detail="Todo list not found")
    
    response = supabase.table("todos").select("*").eq("list_id", list_id).execute()
    return response.data

@app.post("/lists/{list_id}/todos", response_model=Todo, status_code=status.HTTP_201_CREATED)
async def create_todo(list_id: int, todo: TodoCreate, user_id: str = Depends(get_current_user)):
    # Check if list exists and belongs to user
    list_check = supabase.table("todo_lists").select("*").eq("id", list_id).eq("user_id", user_id).execute()
    if not list_check.data:
        raise HTTPException(status_code=404, detail="Todo list not found")
    
    new_todo = {**todo.dict(), "list_id": list_id, "user_id": user_id}
    response = supabase.table("todos").insert(new_todo).execute()
    return response.data[0]

@app.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, todo: TodoCreate, user_id: str = Depends(get_current_user)):
    # Check if todo exists and belongs to user
    todo_check = supabase.table("todos").select("*").eq("id", todo_id).eq("user_id", user_id).execute()
    if not todo_check.data:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    updated_todo = todo.dict()
    response = supabase.table("todos").update(updated_todo).eq("id", todo_id).execute()
    return response.data[0]

@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int, user_id: str = Depends(get_current_user)):
    # Check if todo exists and belongs to user
    todo_check = supabase.table("todos").select("*").eq("id", todo_id).eq("user_id", user_id).execute()
    if not todo_check.data:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    supabase.table("todos").delete().eq("id", todo_id).execute()
    return None

# Folders endpoints
@app.get("/folders", response_model=List[Folder])
async def get_folders(user_id: str = Depends(get_current_user)):
    response = supabase.table("folders").select("*").eq("user_id", user_id).execute()
    return response.data

@app.post("/folders", response_model=Folder, status_code=status.HTTP_201_CREATED)
async def create_folder(folder: FolderCreate, user_id: str = Depends(get_current_user)):
    new_folder = {**folder.dict(), "user_id": user_id}
    response = supabase.table("folders").insert(new_folder).execute()
    return response.data[0]

@app.put("/folders/{folder_id}", response_model=Folder)
async def update_folder(folder_id: int, folder: FolderCreate, user_id: str = Depends(get_current_user)):
    # Check if folder exists and belongs to user
    folder_check = supabase.table("folders").select("*").eq("id", folder_id).eq("user_id", user_id).execute()
    if not folder_check.data:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    updated_folder = folder.dict()
    response = supabase.table("folders").update(updated_folder).eq("id", folder_id).execute()
    return response.data[0]

@app.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(folder_id: int, user_id: str = Depends(get_current_user)):
    # Check if folder exists and belongs to user
    folder_check = supabase.table("folders").select("*").eq("id", folder_id).eq("user_id", user_id).execute()
    if not folder_check.data:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check if folder has any lists
    lists_check = supabase.table("todo_lists").select("*").eq("folder_id", folder_id).execute()
    if lists_check.data:
        raise HTTPException(status_code=400, detail="Cannot delete folder with todo lists")
    
    supabase.table("folders").delete().eq("id", folder_id).execute()
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
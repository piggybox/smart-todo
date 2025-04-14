-- Create tables for Smart Todo App
-- Enable Row Level Security
ALTER DATABASE postgres
SET
    "app.jwt_secret" TO 'your-jwt-secret';

-- Create folders table
CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todo_lists table
CREATE TABLE todo_lists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    folder_id INTEGER REFERENCES folders(id) ON DELETE
    SET
        NULL,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todos table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0,
    list_id INTEGER NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE
    folders ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    todo_lists ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    todos ENABLE ROW LEVEL SECURITY;

-- Create policies for folders
CREATE POLICY "Users can view their own folders" ON folders FOR
SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" ON folders FOR
INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON folders FOR
UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON folders FOR DELETE USING (auth.uid() = user_id);

-- Create policies for todo_lists
CREATE POLICY "Users can view their own todo lists" ON todo_lists FOR
SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todo lists" ON todo_lists FOR
INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todo lists" ON todo_lists FOR
UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todo lists" ON todo_lists FOR DELETE USING (auth.uid() = user_id);

-- Create policies for todos
CREATE POLICY "Users can view their own todos" ON todos FOR
SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todos" ON todos FOR
INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos FOR
UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_folders_user_id ON folders(user_id);

CREATE INDEX idx_todo_lists_user_id ON todo_lists(user_id);

CREATE INDEX idx_todo_lists_folder_id ON todo_lists(folder_id);

CREATE INDEX idx_todos_user_id ON todos(user_id);

CREATE INDEX idx_todos_list_id ON todos(list_id);
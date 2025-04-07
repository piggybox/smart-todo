export interface Todo {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    is_completed: boolean;
    due_date?: string;
    created_at: string;
    updated_at: string;
    is_my_day?: boolean;
    list_id?: string;
}

export interface TodoList {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface MyDaySettings {
    id: string;
    user_id: string;
    last_reset: string;
    ai_suggestions_enabled: boolean;
}
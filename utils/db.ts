import { supabase } from './supabase';
import { Todo, TodoList, MyDaySettings } from '../types';
import { startOfDay } from 'date-fns';

export const db = {
    // Todo Operations
    async createTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo | null> {
        const { data, error } = await supabase
            .from('todos')
            .insert([todo])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null> {
        const { data, error } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteTodo(id: string): Promise<void> {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async getTodos(userId: string): Promise<Todo[]> {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    // List Operations
    async createList(list: Omit<TodoList, 'id' | 'created_at' | 'updated_at'>): Promise<TodoList | null> {
        const { data, error } = await supabase
            .from('lists')
            .insert([list])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getLists(userId: string): Promise<TodoList[]> {
        const { data, error } = await supabase
            .from('lists')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // My Day Operations
    async getMyDayTodos(userId: string): Promise<Todo[]> {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
            .eq('is_my_day', true)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async resetMyDay(userId: string): Promise<void> {
        const { error: updateError } = await supabase
            .from('todos')
            .update({ is_my_day: false })
            .eq('user_id', userId)
            .eq('is_my_day', true);
        if (updateError) throw updateError;

        const { error: settingsError } = await supabase
            .from('my_day_settings')
            .upsert({
                user_id: userId,
                last_reset: startOfDay(new Date()).toISOString(),
            });
        if (settingsError) throw settingsError;
    },

    async getMyDaySettings(userId: string): Promise<MyDaySettings | null> {
        const { data, error } = await supabase
            .from('my_day_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    // Real-time subscriptions
    subscribeToTodos(userId: string, callback: (payload: any) => void) {
        return supabase
            .channel('todos')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${userId}` },
                callback
            )
            .subscribe();
    },
};
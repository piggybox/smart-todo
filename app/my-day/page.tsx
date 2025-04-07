'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/db';
import { generateTodoSuggestions } from '../../utils/openai';
import { Todo } from '../../types';
import { TodoItem } from '../../components/TodoItem';
import { PlusIcon } from '@heroicons/react/24/outline';
import { startOfDay, isAfter } from 'date-fns';

export default function MyDayPage() {
    const { user } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadMyDayTodos = async () => {
            try {
                // Check if we need to reset My Day
                const settings = await db.getMyDaySettings(user.id);
                const lastReset = settings?.last_reset ? new Date(settings.last_reset) : null;
                const shouldReset = !lastReset || isAfter(startOfDay(new Date()), lastReset);

                if (shouldReset) {
                    await db.resetMyDay(user.id);
                    // Get user's task history for AI suggestions
                    const allTodos = await db.getTodos(user.id);
                    const suggestions = await generateTodoSuggestions(allTodos);

                    // Create suggested todos
                    if (suggestions.length > 0) {
                        for (const suggestion of suggestions) {
                            await db.createTodo({
                                user_id: user.id,
                                title: suggestion,
                                is_completed: false,
                                is_my_day: true
                            });
                        }
                    }
                }

                // Load current My Day todos
                const myDayTodos = await db.getMyDayTodos(user.id);
                setTodos(myDayTodos);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading My Day todos:', error);
                setIsLoading(false);
            }
        };

        loadMyDayTodos();

        // Subscribe to real-time updates
        const subscription = db.subscribeToTodos(user.id, (payload) => {
            if (payload.new && payload.new.is_my_day) {
                setTodos((current) => {
                    const exists = current.some((todo) => todo.id === payload.new.id);
                    if (exists) {
                        return current.map((todo) =>
                            todo.id === payload.new.id ? payload.new : todo
                        );
                    }
                    return [...current, payload.new];
                });
            } else if (payload.deleted) {
                setTodos((current) =>
                    current.filter((todo) => todo.id !== payload.deleted.id)
                );
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newTodoTitle.trim()) return;

        try {
            await db.createTodo({
                user_id: user.id,
                title: newTodoTitle.trim(),
                is_completed: false,
                is_my_day: true
            });
            setNewTodoTitle('');
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const handleToggleTodo = async (id: string, completed: boolean) => {
        try {
            await db.updateTodo(id, { is_completed: completed });
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const handleDeleteTodo = async (id: string) => {
        try {
            await db.deleteTodo(id);
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Please sign in to view your todos.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-2xl font-semibold text-gray-900">My Day</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todos.map((todo) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={handleToggleTodo}
                                onDelete={handleDeleteTodo}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
                <form onSubmit={handleAddTodo} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="Add a task"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={!newTodoTitle.trim()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="h-5 w-5 mr-1" />
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
}
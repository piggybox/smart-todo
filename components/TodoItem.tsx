'use client';

import { useState } from 'react';
import { Todo } from '../types';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

type TodoItemProps = {
    todo: Todo;
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onAddToMyDay?: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete, onAddToMyDay }: TodoItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => onToggle(todo.id, !todo.is_completed)}
                    className={clsx(
                        'flex-shrink-0 h-5 w-5',
                        todo.is_completed ? 'text-blue-500' : 'text-gray-300 group-hover:text-gray-400'
                    )}
                >
                    {todo.is_completed ? (
                        <CheckCircleSolidIcon className="h-5 w-5" />
                    ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                    )}
                </button>

                <div className="flex flex-col">
                    <span
                        className={clsx(
                            'text-sm font-medium',
                            todo.is_completed ? 'text-gray-400 line-through' : 'text-gray-700'
                        )}
                    >
                        {todo.title}
                    </span>
                    {todo.description && (
                        <span className="text-xs text-gray-500">{todo.description}</span>
                    )}
                </div>
            </div>

            {isHovered && (
                <div className="flex items-center space-x-2">
                    {onAddToMyDay && !todo.is_my_day && (
                        <button
                            onClick={() => onAddToMyDay(todo.id)}
                            className="text-xs text-gray-500 hover:text-blue-500"
                        >
                            Add to My Day
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(todo.id)}
                        className="text-xs text-gray-500 hover:text-red-500"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
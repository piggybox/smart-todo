'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDaysIcon, ListBulletIcon, PlusIcon } from '@heroicons/react/24/outline';
import { TodoList } from '../types';
import clsx from 'clsx';

type SidebarProps = {
    lists: TodoList[];
    onCreateList: () => void;
};

export function Sidebar({ lists, onCreateList }: SidebarProps) {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="flex flex-col flex-1 overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {/* My Day Section */}
                    <Link
                        href="/my-day"
                        className={clsx(
                            'flex items-center px-2 py-2 text-sm font-medium rounded-md group',
                            pathname === '/my-day'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        )}
                    >
                        <CalendarDaysIcon className="mr-3 h-5 w-5" />
                        My Day
                    </Link>

                    {/* Lists Section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Lists
                            </h3>
                            <button
                                onClick={onCreateList}
                                className="p-1 rounded-md hover:bg-gray-200"
                                aria-label="Create new list"
                            >
                                <PlusIcon className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>

                        {lists.map((list) => (
                            <Link
                                key={list.id}
                                href={`/lists/${list.id}`}
                                className={clsx(
                                    'flex items-center px-2 py-2 text-sm font-medium rounded-md group',
                                    pathname === `/lists/${list.id}`
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                )}
                            >
                                <ListBulletIcon className="mr-3 h-5 w-5" />
                                {list.name}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}
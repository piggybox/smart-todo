'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { TodoList } from '../types';
import { db } from '../utils/db';

export function AppContent({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [lists, setLists] = useState<TodoList[]>([]);

    useEffect(() => {
        if (!user) return;

        const loadLists = async () => {
            try {
                const userLists = await db.getLists(user.id);
                setLists(userLists);
            } catch (error) {
                console.error('Error loading lists:', error);
            }
        };

        loadLists();
    }, [user]);

    const handleCreateList = async () => {
        if (!user) return;

        const name = prompt('Enter list name:');
        if (!name) return;

        try {
            await db.createList({
                user_id: user.id,
                name: name.trim()
            });
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {user && <Sidebar lists={lists} onCreateList={handleCreateList} />}
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
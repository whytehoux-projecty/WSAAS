/**
 * Example: Using Supabase in a Next.js Component
 * 
 * This shows how to fetch data from Supabase in your UHI Staff Portal
 */

'use client'; // Required for Next.js App Router with hooks

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Define TypeScript interface for your data
interface User {
    id: string;
    staff_id: string;
    email: string;
    first_name: string;
    last_name: string;
    status: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getUsers() {
            try {
                setLoading(true);

                // Fetch users from Supabase
                const { data, error } = await supabase
                    .from('users')
                    .select('id, staff_id, email, first_name, last_name, status')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) {
                    throw error;
                }

                if (data) {
                    setUsers(data);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        getUsers();
    }, []);

    if (loading) {
        return <div>Loading users...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Active Users</h1>

            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li key={user.id} className="p-4 border rounded">
                            <div className="font-semibold">
                                {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-600">
                                {user.email} • {user.staff_id}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

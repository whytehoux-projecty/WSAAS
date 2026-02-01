/**
 * Users List Component
 * Displays all active users from Supabase with real-time updates
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
    id: string;
    staff_id: string;
    email: string;
    first_name: string;
    last_name: string;
    status: string;
    avatar_url?: string;
    created_at: string;
}

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch users
    useEffect(() => {
        fetchUsers();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('users-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users',
                },
                (payload) => {
                    console.log('User changed:', payload);
                    fetchUsers(); // Refresh list
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('users')
                .select('id, staff_id, email, first_name, last_name, status, avatar_url, created_at')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }

    // Filter users based on search
    const filteredUsers = users.filter(
        (user) =>
            user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.staff_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                <h3 className="text-red-800 font-semibold">Error Loading Users</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                    onClick={fetchUsers}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Users</h1>
                <p className="text-gray-600">Total: {users.length} users</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name, email, or staff ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    {searchTerm ? 'No users found matching your search.' : 'No active users found.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start space-x-3">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={`${user.first_name} ${user.last_name}`}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-lg">
                                                {user.first_name[0]}
                                                {user.last_name[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                        {user.first_name} {user.last_name}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                    <div className="mt-2 flex items-center space-x-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {user.staff_id}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {user.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

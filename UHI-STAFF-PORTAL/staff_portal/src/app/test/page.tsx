'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
    const [connectionStatus, setConnectionStatus] = useState('Testing connection...');
    const [users, setUsers] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function testConnection() {
            try {
                // Test 1: Fetch users
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('staff_id, first_name, last_name, email, status')
                    .limit(10);

                if (usersError) throw usersError;
                setUsers(usersData || []);

                // Test 2: Fetch loans
                const { data: loansData, error: loansError } = await supabase
                    .from('loans')
                    .select('*')
                    .limit(10);

                if (loansError) throw loansError;
                setLoans(loansData || []);

                // Test 3: Fetch applications
                const { data: appsData, error: appsError } = await supabase
                    .from('applications')
                    .select('*')
                    .limit(10);

                if (appsError) throw appsError;
                setApplications(appsData || []);

                setConnectionStatus('✅ Connection successful!');
            } catch (err) {
                console.error('Connection error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setConnectionStatus('❌ Connection failed');
            }
        }

        testConnection();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🎉 Supabase Connection Test
                    </h1>
                    <p className="text-lg text-gray-600">UHI Staff Portal - Frontend Integration</p>

                    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-xl font-semibold">{connectionStatus}</p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <h3 className="text-red-800 font-semibold text-lg mb-2">Error</h3>
                        <p className="text-red-600">{error}</p>
                        <p className="text-sm text-red-500 mt-2">
                            Check browser console for more details
                        </p>
                    </div>
                )}

                {/* Users Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        👥 Users ({users.length})
                    </h2>
                    {users.length === 0 ? (
                        <p className="text-gray-500">No users found or loading...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.map((user) => (
                                <div
                                    key={user.staff_id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="font-semibold text-lg text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">{user.email}</div>
                                    <div className="mt-2 flex items-center space-x-2">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                            {user.staff_id}
                                        </span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                            {user.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loans Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        💰 Loans ({loans.length})
                    </h2>
                    {loans.length === 0 ? (
                        <p className="text-gray-500">No loans found or loading...</p>
                    ) : (
                        <div className="space-y-3">
                            {loans.map((loan) => (
                                <div
                                    key={loan.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {new Intl.NumberFormat('en-UG', {
                                                    style: 'currency',
                                                    currency: loan.currency || 'UGX',
                                                }).format(loan.amount)}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">{loan.reason}</div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${loan.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : loan.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {loan.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Balance: {new Intl.NumberFormat('en-UG', {
                                            style: 'currency',
                                            currency: loan.currency || 'UGX',
                                        }).format(loan.balance)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Applications Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        📝 Applications ({applications.length})
                    </h2>
                    {applications.length === 0 ? (
                        <p className="text-gray-500">No applications found or loading...</p>
                    ) : (
                        <div className="space-y-3">
                            {applications.map((app) => (
                                <div
                                    key={app.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-gray-900 capitalize">
                                                {app.type} Application
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {app.data?.reason || 'No reason provided'}
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : app.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : app.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Raw Data (for debugging) */}
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 text-white">
                    <h2 className="text-xl font-bold mb-4">🔍 Raw Data (Debug)</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Users:</h3>
                            <pre className="bg-gray-800 p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(users, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Loans:</h3>
                            <pre className="bg-gray-800 p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(loans, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Applications:</h3>
                            <pre className="bg-gray-800 p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(applications, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {!error && users.length > 0 && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-green-800 font-semibold text-lg mb-2">
                            ✅ All Tests Passed!
                        </h3>
                        <p className="text-green-700">
                            Your Supabase integration is working perfectly! You can now:
                        </p>
                        <ul className="list-disc list-inside text-green-700 mt-2 space-y-1">
                            <li>Use the example components (UsersList, LoansDashboard, ApplicationsManager)</li>
                            <li>Build new features with real-time data</li>
                            <li>Access the Supabase Dashboard to manage data</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

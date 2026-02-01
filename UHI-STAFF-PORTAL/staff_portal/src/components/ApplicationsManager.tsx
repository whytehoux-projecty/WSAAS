/**
 * Applications Manager Component
 * Create, view, and manage leave/loan applications
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Application {
    id: string;
    user_id: string;
    type: string;
    status: string;
    start_date: string;
    end_date: string;
    reason?: string;
    comments?: string;
    approved_by?: string;
    approved_at?: string;
    created_at: string;
}

export default function ApplicationsManager() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'leave',
        start_date: '',
        end_date: '',
        reason: '',
    });

    useEffect(() => {
        fetchApplications();

        // Real-time subscription
        const channel = supabase
            .channel('applications-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'applications',
                },
                (payload) => {
                    console.log('Application changed:', payload);
                    fetchApplications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchApplications() {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setApplications(data || []);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error('Not authenticated');

            const { error } = await supabase.from('applications').insert({
                user_id: user.user.id,
                type: formData.type,
                start_date: formData.start_date,
                end_date: formData.end_date,
                reason: formData.reason,
                status: 'pending',
            });

            if (error) throw error;

            // Reset form
            setFormData({
                type: 'leave',
                start_date: '',
                end_date: '',
                reason: '',
            });
            setShowForm(false);
            fetchApplications();
        } catch (err) {
            console.error('Error creating application:', err);
            alert(err instanceof Error ? err.message : 'Failed to create application');
        }
    }

    async function handleWithdraw(id: string) {
        if (!confirm('Are you sure you want to withdraw this application?')) return;

        try {
            const { error } = await supabase.from('applications').delete().eq('id', id);

            if (error) throw error;

            fetchApplications();
        } catch (err) {
            console.error('Error withdrawing application:', err);
            alert(err instanceof Error ? err.message : 'Failed to withdraw application');
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-UG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading applications...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
                    <p className="text-gray-600">Submit and track your leave applications</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Application'}
                </button>
            </div>

            {/* Application Form */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">New Application</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="leave">Leave</option>
                                <option value="sick">Sick Leave</option>
                                <option value="maternity">Maternity Leave</option>
                                <option value="paternity">Paternity Leave</option>
                                <option value="study">Study Leave</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Please provide a reason for your application..."
                                required
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Submit Application
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Applications List */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {applications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No applications found. Create your first application!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                            {app.type} Application
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                app.status
                                            )}`}
                                        >
                                            {app.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <div className="text-sm text-gray-600">Start Date</div>
                                            <div className="font-medium text-gray-900">{formatDate(app.start_date)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">End Date</div>
                                            <div className="font-medium text-gray-900">{formatDate(app.end_date)}</div>
                                        </div>
                                    </div>

                                    {app.reason && (
                                        <div className="mt-4">
                                            <div className="text-sm text-gray-600 mb-1">Reason</div>
                                            <p className="text-gray-900">{app.reason}</p>
                                        </div>
                                    )}

                                    {app.comments && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">Manager Comments</div>
                                            <p className="text-gray-900">{app.comments}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 text-sm text-gray-600">
                                        Submitted: {formatDate(app.created_at)}
                                        {app.approved_at && ` • Processed: ${formatDate(app.approved_at)}`}
                                    </div>
                                </div>

                                {app.status === 'pending' && (
                                    <button
                                        onClick={() => handleWithdraw(app.id)}
                                        className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Withdraw
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

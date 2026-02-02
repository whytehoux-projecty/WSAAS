'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';

interface StaffMember {
    id: string;
    staffId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    position: string;
    status: 'active' | 'inactive';
}

export default function StaffManagementPage() {
    return (
        <ProtectedRoute>
            <StaffManagementContent />
        </ProtectedRoute>
    );
}

function StaffManagementContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<string>('');

    // Form state
    const [formData, setFormData] = useState({
        staffId: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'staff',
        department: '',
        position: '',
        password: '',
    });

    useEffect(() => {
        loadStaff();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [staff, searchQuery, statusFilter, roleFilter]);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const res = await API.request('/admin/users', { auth: true });
            const staffData = res?.data || [];

            // Map backend response (snake_case) to frontend interface (camelCase)
            const mappedStaff: StaffMember[] = staffData.map((user: any) => ({
                id: user.id,
                staffId: user.staff_id || 'N/A',
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email,
                role: user.roles?.[0]?.role?.name || 'staff',
                department: user.employment_history?.[0]?.department?.name || 'Unassigned',
                position: user.employment_history?.[0]?.position_title || 'Unassigned',
                status: user.status || 'inactive'
            }));

            setStaff(mappedStaff);
        } catch (error) {
            console.error('Error loading staff:', error);
            setMessage({ type: 'error', text: 'Failed to load staff list' });
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...staff];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (member) =>
                    member.firstName.toLowerCase().includes(query) ||
                    member.lastName.toLowerCase().includes(query) ||
                    member.staffId.toLowerCase().includes(query) ||
                    member.email.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter((member) => member.status === statusFilter);
        }

        // Role filter
        if (roleFilter) {
            filtered = filtered.filter((member) => member.role === roleFilter);
        }

        setFilteredStaff(filtered);
    };

    const handleOpenModal = (staff?: StaffMember) => {
        if (staff) {
            setEditingStaff(staff);
            setFormData({
                staffId: staff.staffId,
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                role: staff.role,
                department: staff.department,
                position: staff.position,
                password: '',
            });
        } else {
            setEditingStaff(null);
            setFormData({
                staffId: '',
                firstName: '',
                lastName: '',
                email: '',
                role: 'staff',
                department: '',
                position: '',
                password: '',
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (editingStaff) {
                // Update existing staff
                await API.request(`/admin/users/${editingStaff.id}`, {
                    method: 'PUT',
                    auth: true,
                    body: formData,
                });
                setMessage({ type: 'success', text: 'Staff updated successfully!' });
            } else {
                // Create new staff
                await API.request('/admin/users', {
                    method: 'POST',
                    auth: true,
                    body: formData,
                });
                setMessage({ type: 'success', text: 'Staff created successfully!' });
            }

            setShowModal(false);
            loadStaff();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save staff' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, newStatus: 'active' | 'inactive') => {
        if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this staff member?`)) {
            return;
        }

        try {
            await API.request(`/admin/users/${id}`, {
                method: 'PUT',
                auth: true,
                body: { status: newStatus },
            });
            setMessage({ type: 'success', text: `Staff ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!` });
            loadStaff();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update status' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminHeader />

            <main className="flex-1 lg:ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                            <p className="text-gray-600 mt-1">Manage staff members and their roles</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn bg-[var(--primary-color)] text-white hover:opacity-90 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Staff
                        </button>
                    </div>

                    {/* Alert Messages */}
                    {message && (
                        <div
                            className={`mb-6 p-4 rounded-lg border-2 animate-fade-in ${message.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
                                <span className="font-medium">{message.text}</span>
                            </div>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, ID, or email..."
                                    className="input"
                                />
                            </div>

                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="input"
                                    title="Filter by status"
                                    aria-label="Filter by status"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="input"
                                    title="Filter by role"
                                    aria-label="Filter by role"
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Staff Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[var(--primary-color)]"></div>
                                <p className="text-gray-600 mt-4">Loading...</p>
                            </div>
                        ) : filteredStaff.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4 opacity-50">👥</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members found</h3>
                                <p className="text-gray-600">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Staff ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredStaff.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {member.staffId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {member.firstName} {member.lastName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {member.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                    {member.role}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {member.department || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(member)}
                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    member.id,
                                                                    member.status === 'active' ? 'inactive' : 'active'
                                                                )
                                                            }
                                                            className={`font-medium ${member.status === 'active'
                                                                ? 'text-red-600 hover:text-red-800'
                                                                : 'text-green-600 hover:text-green-800'
                                                                }`}
                                                        >
                                                            {member.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Close"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="staffId" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Staff ID *
                                    </label>
                                    <input
                                        type="text"
                                        id="staffId"
                                        value={formData.staffId}
                                        onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Role *
                                    </label>
                                    <select
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="input"
                                        required
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Position
                                </label>
                                <input
                                    type="text"
                                    id="position"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="input"
                                />
                            </div>

                            {!editingStaff && (
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="input"
                                        minLength={6}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                >
                                    {loading ? 'Saving...' : editingStaff ? 'Update Staff' : 'Create Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

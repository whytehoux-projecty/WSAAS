'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import {
    User,
    Lock,
    Bell,
    Globe,
    Shield,
    Mail,
    Phone,
    Eye,
    EyeOff,
    CheckCircle
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: true,
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        transactionAlerts: true,
        loginAlerts: true,
        marketingEmails: false,
    });

    const [preferences, setPreferences] = useState({
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York',
        theme: 'light',
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
        { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
        { id: 'preferences', label: 'Preferences', icon: <Globe className="w-5 h-5" /> },
    ];

    const handleSaveProfile = () => {
        alert('Profile updated successfully!');
    };

    const handleChangePassword = () => {
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        alert('Password changed successfully!');
        setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleSaveNotifications = () => {
        alert('Notification settings saved!');
    };

    const handleSavePreferences = () => {
        alert('Preferences saved!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">Settings</h1>
                <p className="text-lg text-charcoal-light">Manage your account settings and preferences</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-vintage-green text-white shadow-vintage-md'
                                : 'bg-white text-charcoal hover:bg-parchment border border-faded-gray-light'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                            />
                            <Input
                                label="Last Name"
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Email Address"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            icon={<Mail className="w-5 h-5" />}
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            icon={<Phone className="w-5 h-5" />}
                        />
                        <Input
                            label="Address"
                            type="text"
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        />
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input
                                label="City"
                                type="text"
                                value={profileData.city}
                                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                            />
                            <Input
                                label="State"
                                type="text"
                                value={profileData.state}
                                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                            />
                            <Input
                                label="ZIP Code"
                                type="text"
                                value={profileData.zipCode}
                                onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                            />
                        </div>
                        <Button variant="primary" size="large" onClick={handleSaveProfile}>
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your account password</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Input
                                    label="Current Password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={securityData.currentPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                    icon={<Lock className="w-5 h-5" />}
                                />
                                <button
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-9 text-charcoal-lighter hover:text-charcoal transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    label="New Password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={securityData.newPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                    icon={<Lock className="w-5 h-5" />}
                                />
                                <button
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-9 text-charcoal-lighter hover:text-charcoal transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={securityData.confirmPassword}
                                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                icon={<Lock className="w-5 h-5" />}
                            />
                            <Button variant="primary" size="large" onClick={handleChangePassword}>
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Two-Factor Authentication</CardTitle>
                            <CardDescription>Add an extra layer of security to your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-parchment rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-vintage-green" />
                                    <div>
                                        <p className="font-semibold text-charcoal">Two-Factor Authentication</p>
                                        <p className="text-sm text-charcoal-light">
                                            {securityData.twoFactorEnabled ? 'Currently enabled' : 'Currently disabled'}
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={securityData.twoFactorEnabled}
                                        onChange={(e) => setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-faded-gray rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-vintage-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Choose how you want to be notified</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            {[
                                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                                { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via text message' },
                                { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications on your device' },
                                { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'Get notified of all transactions' },
                                { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified of new login attempts' },
                                { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional offers and updates' },
                            ].map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between p-4 bg-parchment rounded-lg">
                                    <div>
                                        <p className="font-semibold text-charcoal">{setting.label}</p>
                                        <p className="text-sm text-charcoal-light">{setting.description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                [setting.key]: e.target.checked
                                            })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-faded-gray rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-vintage-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <Button variant="primary" size="large" onClick={handleSaveNotifications}>
                            Save Preferences
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Application Preferences</CardTitle>
                        <CardDescription>Customize your banking experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Language</label>
                            <select
                                value={preferences.language}
                                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Currency</label>
                            <select
                                value={preferences.currency}
                                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Timezone</label>
                            <select
                                value={preferences.timezone}
                                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                            >
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Chicago">Central Time (CT)</option>
                                <option value="America/Denver">Mountain Time (MT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Theme</label>
                            <select
                                value={preferences.theme}
                                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto (System)</option>
                            </select>
                        </div>
                        <Button variant="primary" size="large" onClick={handleSavePreferences}>
                            Save Preferences
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Security Info */}
            <Card className="bg-gradient-to-br from-parchment to-warm-cream border-vintage-green/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-vintage-green/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-vintage-green" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-charcoal mb-2">Security Tips</h3>
                            <ul className="space-y-1 text-sm text-charcoal-light">
                                <li>• Use a strong, unique password for your account</li>
                                <li>• Enable two-factor authentication for added security</li>
                                <li>• Never share your password or security codes</li>
                                <li>• Review your account activity regularly</li>
                                <li>• Keep your contact information up to date</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

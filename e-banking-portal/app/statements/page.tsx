'use client';

import { useState, useEffect } from 'react';
import apiClient, { api } from '@/lib/api-client';
import { Download, FileText, Calendar, Filter } from 'lucide-react';

export default function StatementsPage() {
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchStatements();
    }, []);

    const fetchStatements = async () => {
        try {
            const response = await api.statements.getAll();
            // Expected response: { statements: [...] }
            setStatements(response.statements || []);
        } catch (error) {
            console.error('Failed to fetch statements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: string, filename: string) => {
        try {
            const blob = await api.statements.download(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // Fetch accounts to get an ID for the first account
            // In a real app, we'd pick which account to generate for
            const accountsRes = await api.accounts.getAll();
            const accounts = accountsRes.accounts || [];

            if (accounts.length > 0) {
                await apiClient.post('/api/statements/generate', {
                    accountId: accounts[0].id
                });
                // Refresh list
                await fetchStatements();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate statement');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-vintage-gold animate-pulse">Loading statements...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-vintage-gold font-heading">Account Statements</h1>
                    <p className="text-gray-400">View and download your monthly financial statements</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-4 py-2 bg-vintage-gold/10 text-vintage-gold border border-vintage-gold rounded-lg hover:bg-vintage-gold hover:text-black transition-all disabled:opacity-50 text-sm font-semibold"
                >
                    {generating ? 'Generating...' : 'Generate New Statement'}
                </button>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 table-row">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Period</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Account</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Generated On</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {statements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No statements available yet. Try generating one.
                                    </td>
                                </tr>
                            ) : (
                                statements.map((statement) => (
                                    <tr key={statement.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-vintage-gold/20 to-transparent rounded-lg text-vintage-gold">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="text-gray-200 font-medium">
                                                    {new Date(statement.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            <div className="flex flex-col">
                                                <span className="text-gray-300">{statement.account.accountType}</span>
                                                <span className="text-xs text-gray-500">****{statement.account.accountNumber.slice(-4)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(statement.generatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-vintage-gold/10 text-vintage-gold border border-vintage-gold/20">
                                                {statement.statementType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownload(statement.id, `Statement-${new Date(statement.periodStart).toISOString().slice(0, 7)}.pdf`)}
                                                className="text-gray-500 hover:text-vintage-gold transition-colors p-2 hover:bg-white/5 rounded-full"
                                                title="Download PDF"
                                                aria-label={`Download statement for ${new Date(statement.periodStart).toLocaleDateString()}`}
                                            >
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

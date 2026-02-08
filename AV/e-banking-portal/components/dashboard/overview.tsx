"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewProps {
    data?: any[];
    income?: number; // Keep for backward compatibility if needed, or remove
    expense?: number;
}

export function Overview({ data, income, expense }: OverviewProps) {
    // Use provided data or fallback to single bar
    const chartData = data || [
        {
            name: "Current Month",
            income: income || 0,
            expense: expense || 0,
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                    cursor={{ fill: 'transparent' }}
                />
                <Bar
                    dataKey="income"
                    fill="#16a34a" // Green
                    name="Income"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                />
                <Bar
                    dataKey="expense"
                    fill="#dc2626" // Red
                    name="Expense"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

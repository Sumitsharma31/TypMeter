"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { ScoreRecord } from "@/components/PreviousScores";

interface HistoryChartProps {
    data: ScoreRecord[];
}

export default function HistoryChart({ data }: HistoryChartProps) {
    const chartData = useMemo(() => {
        // Reverse data to show oldest to newest
        const sortedData = [...data].reverse();
        return sortedData.map((d, index) => ({
            name: index + 1, // just test number order
            wpm: d.wpm,
            accuracy: d.accuracy,
            date: new Date(d.created_at).toLocaleDateString(),
        }));
    }, [data]);

    if (!data || data.length === 0) return null;

    // Calculate average for reference line (could handle in future)
    const avgWpm = Math.round(
        data.reduce((acc, curr) => acc + curr.wpm, 0) / data.length
    );

    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        itemStyle={{ color: "#e2e8f0" }}
                        labelStyle={{ color: "#94a3b8", marginBottom: "0.5rem" }}
                        labelFormatter={(label) => `Test #${label}`}
                    />
                    <Area
                        type="monotone"
                        dataKey="wpm"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorWpm)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#fff" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

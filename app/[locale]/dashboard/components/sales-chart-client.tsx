"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SalesDataPoint } from "../types/dashboard";

interface SalesChartClientProps {
  data: SalesDataPoint[];
}

export function SalesChartClient({ data }: SalesChartClientProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis
          dataKey="day"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          domain={[30, 110]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Area
          type="monotone"
          dataKey="value1"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorValue1)"
        />
        <Area
          type="monotone"
          dataKey="value2"
          stroke="#f97316"
          fillOpacity={1}
          fill="url(#colorValue2)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

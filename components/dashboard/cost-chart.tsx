"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Task, Resource, TaskAllocation } from "@/lib/cost";
import { calculateTaskCost } from "@/lib/cost";
import { useTheme } from "@/components/shell/theme-provider";

interface CostChartProps {
  tasks: Task[];
  resources: Resource[];
  allocations: TaskAllocation[];
}

export function CostChart({ tasks, resources, allocations }: CostChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const data = React.useMemo(
    () =>
      tasks.map((t) => ({
        name: t.name.length > 18 ? t.name.slice(0, 16) + "…" : t.name,
        cost: calculateTaskCost(t, resources, allocations),
      })),
    [tasks, resources, allocations],
  );

  const grid = isDark ? "hsl(217 33% 20%)" : "hsl(214 32% 88%)";
  const axis = isDark ? "hsl(215 20% 65%)" : "hsl(215 16% 47%)";
  const barColor = isDark ? "hsl(217 91% 60%)" : "hsl(221 83% 53%)";
  const tooltipBg = isDark ? "hsl(222 47% 9%)" : "hsl(0 0% 100%)";
  const tooltipBorder = isDark ? "hsl(217 33% 17%)" : "hsl(214 32% 91%)";
  const tooltipFg = isDark ? "hsl(210 40% 96%)" : "hsl(222 47% 11%)";

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-10}
          textAnchor="end"
          height={50}
        />
        <YAxis
          stroke={axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v.toLocaleString()}`}
        />
        <Tooltip
          cursor={{ fill: isDark ? "hsl(217 33% 17%)" : "hsl(210 40% 94%)" }}
          contentStyle={{
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 8,
            color: tooltipFg,
            fontSize: 12,
          }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Cost"]}
          labelStyle={{ color: tooltipFg, fontWeight: 600 }}
        />
        <Bar dataKey="cost" fill={barColor} radius={[6, 6, 0, 0]} isAnimationActive={false} maxBarSize={64} />
      </BarChart>
    </ResponsiveContainer>
  );
}

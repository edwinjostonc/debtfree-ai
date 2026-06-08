"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlySummary } from "@/lib/financial/types";

interface Props {
  monthlySummary: MonthlySummary[];
  debts: { id: string; name: string; balance: number }[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export function DashboardCharts({ monthlySummary }: Props) {
  const chartData = monthlySummary.map((m) => ({
    name: m.date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    balance: Math.round(m.totalBalance),
    principal: Math.round(m.totalPrincipal),
    interest: Math.round(m.totalInterest),
  }));

  // Sample every nth row to avoid too many ticks
  const step = Math.max(1, Math.floor(chartData.length / 12));
  const displayData = chartData.filter((_, i) => i % step === 0 || i === chartData.length - 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debt Balance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={displayData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={52} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Area
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#10b981"
                fill="url(#balGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={displayData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={52} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="principal" name="Principal" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="interest" name="Interest" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

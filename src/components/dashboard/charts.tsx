"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlySummary } from "@/lib/financial/types";

interface Props {
  monthlySummary: MonthlySummary[];
  debts: { id: string; name: string; balance: number }[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#1a1a2e] bg-[#0c0c16] p-3 text-xs shadow-2xl">
      <p className="mb-2 font-medium text-[#5a5a7a]">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-white">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function DashboardCharts({ monthlySummary }: Props) {
  if (!monthlySummary.length) return null;

  const step = Math.max(1, Math.floor(monthlySummary.length / 12));
  const displayData = monthlySummary
    .filter((_, i) => i % step === 0 || i === monthlySummary.length - 1)
    .map((m) => ({
      name: m.date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      balance: Math.round(m.totalBalance),
      principal: Math.round(m.totalPrincipal),
      interest: Math.round(m.totalInterest),
    }));

  const axisStyle = { fontSize: 11, fill: "#5a5a7a" };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Balance Over Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={displayData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={axisStyle} width={44} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#7c3aed" fill="url(#balGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Monthly Breakdown</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={displayData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={axisStyle} width={44} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#5a5a7a" }} />
              <Bar dataKey="principal" name="Principal" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="interest" name="Interest" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

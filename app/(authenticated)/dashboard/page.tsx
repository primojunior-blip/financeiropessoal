"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface DashboardData {
  totalPayable: number;
  totalReceivable: number;
  paid: number;
  received: number;
  pendingPayable: number;
  overdue: number;
  balance: number;
  byCategory: { name: string; color: string; amount: number }[];
  monthlyFlow: { month: string; receitas: number; despesas: number }[];
  recentTransactions: {
    id: string;
    description: string;
    amount: number;
    type: string;
    status: string;
    dueDate: string;
    category?: { name: string; color: string } | null;
  }[];
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: "green" | "red" | "yellow" | "blue";
}) {
  const colors = {
    green: "border-[#22c55e]/30 bg-[#22c55e]/5",
    red: "border-[#ef4444]/30 bg-[#ef4444]/5",
    yellow: "border-[#f59e0b]/30 bg-[#f59e0b]/5",
    blue: "border-[#3b82f6]/30 bg-[#3b82f6]/5",
  };
  const textColors = {
    green: "text-[#22c55e]",
    red: "text-[#ef4444]",
    yellow: "text-[#f59e0b]",
    blue: "text-[#3b82f6]",
  };
  return (
    <div className={`rounded-xl border ${colors[color]} p-5`}>
      <p className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?month=${month}&year=${year}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[#94a3b8]">
          <div className="w-5 h-5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Dashboard</h1>
        <p className="text-[#94a3b8] text-sm mt-1 capitalize">{monthLabel}</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Saldo do Mês"
          value={formatCurrency(data.balance)}
          sub={`Recebido − Pago`}
          color={data.balance >= 0 ? "green" : "red"}
        />
        <StatCard
          label="A Receber"
          value={formatCurrency(data.totalReceivable)}
          sub={`${formatCurrency(data.received)} recebido`}
          color="blue"
        />
        <StatCard
          label="A Pagar"
          value={formatCurrency(data.totalPayable)}
          sub={`${formatCurrency(data.pendingPayable)} pendente`}
          color="yellow"
        />
        <StatCard
          label="Em Atraso"
          value={formatCurrency(data.overdue)}
          sub="Atenção necessária"
          color={data.overdue > 0 ? "red" : "green"}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Fluxo mensal */}
        <div className="xl:col-span-2 bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#e2e8f0] mb-4">Fluxo de Caixa</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthlyFlow}>
              <defs>
                <linearGradient id="receitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="despesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: 8 }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Legend />
              <Area type="monotone" dataKey="receitas" stroke="#22c55e" fill="url(#receitas)" strokeWidth={2} name="Receitas" />
              <Area type="monotone" dataKey="despesas" stroke="#ef4444" fill="url(#despesas)" strokeWidth={2} name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Por categoria */}
        <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#e2e8f0] mb-4">Despesas por Categoria</h2>
          {data.byCategory.length === 0 ? (
            <p className="text-[#94a3b8] text-sm text-center mt-8">Nenhum dado</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="amount"
                  nameKey="name"
                >
                  {data.byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: 8 }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
                <Legend
                  formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Comparativo pago vs planejado */}
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#e2e8f0] mb-4">Planejado vs Realizado</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={[
              { name: "Receitas", planejado: data.totalReceivable, realizado: data.received },
              { name: "Despesas", planejado: data.totalPayable, realizado: data.paid },
            ]}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "#1a1d2e", border: "1px solid #2a2d3e", borderRadius: 8 }}
              formatter={(v) => formatCurrency(Number(v))}
            />
            <Legend />
            <Bar dataKey="planejado" fill="#3b82f6" opacity={0.6} name="Planejado" radius={[4, 4, 0, 0]} />
            <Bar dataKey="realizado" fill="#22c55e" name="Realizado" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lançamentos recentes */}
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#e2e8f0] mb-4">Lançamentos Recentes</h2>
        {data.recentTransactions.length === 0 ? (
          <p className="text-[#94a3b8] text-sm text-center py-8">Nenhum lançamento este mês</p>
        ) : (
          <div className="space-y-2">
            {data.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#222640] transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: t.category?.color ?? "#94a3b8" }}
                  />
                  <div>
                    <p className="text-sm text-[#e2e8f0] font-medium">{t.description}</p>
                    <p className="text-xs text-[#94a3b8]">
                      {t.category?.name ?? "Sem categoria"} · {formatDate(t.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(t.status)}`}>
                    {getStatusLabel(t.status)}
                  </span>
                  <span className={`text-sm font-semibold ${t.type === "receivable" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                    {t.type === "receivable" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

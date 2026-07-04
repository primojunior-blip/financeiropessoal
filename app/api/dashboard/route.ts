import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const { data: transactions, error } = await supabase
      .from("Transaction")
      .select("*, category:Category(*)")
      .gte("dueDate", startDate.toISOString())
      .lte("dueDate", endDate.toISOString());

    if (error) throw error;

    const txs = transactions || [];

    const totalPayable = txs
      .filter((t) => t.type === "payable")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceivable = txs
      .filter((t) => t.type === "receivable")
      .reduce((sum, t) => sum + t.amount, 0);

    const paid = txs
      .filter((t) => t.type === "payable" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    const received = txs
      .filter((t) => t.type === "receivable" && t.status === "received")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayable = txs
      .filter((t) => t.type === "payable" && t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const overdue = txs
      .filter((t) => t.status === "overdue" || (t.status === "pending" && new Date(t.dueDate) < new Date()))
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = txs
      .filter((t) => t.type === "payable")
      .reduce<Record<string, { name: string; color: string; amount: number }>>((acc, t: any) => {
        const key = t.categoryId ?? "sem-categoria";
        const label = t.category?.name ?? "Sem Categoria";
        const color = t.category?.color ?? "#94a3b8";
        if (!acc[key]) acc[key] = { name: label, color, amount: 0 };
        acc[key].amount += t.amount;
        return acc;
      }, {});

    const monthlyFlow: { month: string; receitas: number; despesas: number }[] = [];
    for (let m = Math.max(1, month - 5); m <= month; m++) {
      const mStart = new Date(year, m - 1, 1);
      const mEnd = new Date(year, m, 0, 23, 59, 59);
      const { data: monthTxs } = await supabase
        .from("Transaction")
        .select("type, amount")
        .gte("dueDate", mStart.toISOString())
        .lte("dueDate", mEnd.toISOString());
      const label = mStart.toLocaleDateString("pt-BR", { month: "short" });
      monthlyFlow.push({
        month: label,
        receitas: (monthTxs || []).filter((t: any) => t.type === "receivable").reduce((s: number, t: any) => s + t.amount, 0),
        despesas: (monthTxs || []).filter((t: any) => t.type === "payable").reduce((s: number, t: any) => s + t.amount, 0),
      });
    }

    const recentTransactions = txs
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .slice(0, 8);

    return NextResponse.json({
      totalPayable,
      totalReceivable,
      paid,
      received,
      pendingPayable,
      overdue,
      balance: received - paid,
      byCategory: Object.values(byCategory),
      monthlyFlow,
      recentTransactions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar dados do dashboard" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Busca todos os orçamentos globais
    const budgets = await prisma.budget.findMany({
      include: { category: true },
    });

    // Calcula o gasto do mês selecionado para cada categoria orçada
    const result = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            categoryId: budget.categoryId,
            type: "payable",
            dueDate: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        });

        const spentAmount = spent._sum.amount ?? 0;
        const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;

        return {
          ...budget,
          spent: spentAmount,
          percentage: Math.min(percentage, 100),
          status: percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "ok",
        };
      })
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar progresso do orçamento" }, { status: 500 });
  }
}

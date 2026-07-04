import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json({ error: "Mês e ano são obrigatórios" }, { status: 400 });
    }

    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: { isActive: true },
    });

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const created: unknown[] = [];
    for (const fe of fixedExpenses) {
      const existing = await prisma.transaction.findFirst({
        where: { fixedExpenseId: fe.id, dueDate: { gte: startDate, lte: endDate } },
      });
      if (!existing) {
        const day = Math.min(fe.dayOfMonth, endDate.getDate());
        const dueDate = new Date(Number(year), Number(month) - 1, day);
        const tx = await prisma.transaction.create({
          data: {
            description: fe.description,
            amount: fe.amount,
            type: fe.type,
            dueDate,
            categoryId: fe.categoryId,
            isFixed: true,
            fixedExpenseId: fe.id,
            status: "pending",
          },
        });
        created.push(tx);
      }
    }

    return NextResponse.json({ generated: created.length, transactions: created });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar contas fixas" }, { status: 500 });
  }
}

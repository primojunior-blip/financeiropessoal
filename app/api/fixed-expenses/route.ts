import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const fixedExpenses = await prisma.fixedExpense.findMany({
      include: { category: true },
      orderBy: { dayOfMonth: "asc" },
    });
    return NextResponse.json(fixedExpenses);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar contas fixas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, amount, type, dayOfMonth, categoryId, notes } = body;

    if (!description || !amount || !type || !dayOfMonth) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const fixedExpense = await prisma.fixedExpense.create({
      data: {
        description,
        amount: Number(amount),
        type,
        dayOfMonth: Number(dayOfMonth),
        categoryId: categoryId || null,
        notes: notes || null,
        isActive: true,
      },
      include: { category: true },
    });

    // Auto-gera lançamento para o mês atual
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const endDate = new Date(year, month, 0);
    const day = Math.min(Number(dayOfMonth), endDate.getDate());
    const dueDate = new Date(year, month - 1, day);

    await prisma.transaction.create({
      data: {
        description,
        amount: Number(amount),
        type,
        dueDate,
        categoryId: categoryId || null,
        isFixed: true,
        fixedExpenseId: fixedExpense.id,
        status: "pending",
      },
    });

    return NextResponse.json(fixedExpense, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar conta fixa" }, { status: 500 });
  }
}

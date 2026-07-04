import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      where.dueDate = { gte: startDate, lte: endDate };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, creditCard: true },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar transações" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, amount, type, dueDate, categoryId, creditCardId, notes, isFixed } = body;

    if (!description || !amount || !type || !dueDate) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: Number(amount),
        type,
        dueDate: new Date(dueDate),
        categoryId: categoryId || null,
        creditCardId: creditCardId || null,
        notes: notes || null,
        isFixed: isFixed ?? false,
        status: "pending",
      },
      include: { category: true, creditCard: true },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 });
  }
}

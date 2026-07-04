import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });
    return NextResponse.json(budgets);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar orçamentos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryId, amount } = body;

    if (!categoryId || !amount) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: { categoryId },
      update: { amount: Number(amount) },
      create: { categoryId, amount: Number(amount) },
      include: { category: true },
    });
    return NextResponse.json(budget, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar orçamento" }, { status: 500 });
  }
}

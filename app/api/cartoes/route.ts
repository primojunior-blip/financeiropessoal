import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cartoes = await prisma.creditCard.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { transactions: true } },
        transactions: {
          select: { amount: true, status: true, dueDate: true },
        },
      },
    });
    return NextResponse.json(cartoes);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar cartões" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, lastFour, dueDay, closingDay, limit, color } = body;
    if (!name || !dueDay || !closingDay) {
      return NextResponse.json({ error: "Nome, vencimento e fechamento são obrigatórios" }, { status: 400 });
    }
    const cartao = await prisma.creditCard.create({
      data: {
        name,
        lastFour: lastFour || null,
        dueDay: Number(dueDay),
        closingDay: Number(closingDay),
        limit: limit ? Number(limit) : null,
        color: color ?? "#8b5cf6",
      },
    });
    return NextResponse.json(cartao, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar cartão" }, { status: 500 });
  }
}

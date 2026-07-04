import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cartao = await prisma.creditCard.findUnique({
      where: { id },
      include: {
        transactions: {
          include: { category: true },
          orderBy: { dueDate: "asc" },
        },
      },
    });
    if (!cartao) return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
    return NextResponse.json(cartao);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar cartão" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, lastFour, dueDay, closingDay, limit, color, isActive } = body;
    const cartao = await prisma.creditCard.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(lastFour !== undefined && { lastFour }),
        ...(dueDay !== undefined && { dueDay: Number(dueDay) }),
        ...(closingDay !== undefined && { closingDay: Number(closingDay) }),
        ...(limit !== undefined && { limit: limit ? Number(limit) : null }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return NextResponse.json(cartao);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar cartão" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.creditCard.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar cartão" }, { status: 500 });
  }
}

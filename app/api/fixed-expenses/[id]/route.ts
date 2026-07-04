import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { description, amount, type, dayOfMonth, categoryId, notes, isActive } = body;

    const fixedExpense = await prisma.fixedExpense.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(type !== undefined && { type }),
        ...(dayOfMonth !== undefined && { dayOfMonth: Number(dayOfMonth) }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { category: true },
    });
    return NextResponse.json(fixedExpense);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar conta fixa" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.fixedExpense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar conta fixa" }, { status: 500 });
  }
}

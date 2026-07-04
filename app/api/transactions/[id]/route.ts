import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { description, amount, type, status, dueDate, paidAt, categoryId, notes } = body;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: { category: true },
    });
    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar transação" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar transação" }, { status: 500 });
  }
}

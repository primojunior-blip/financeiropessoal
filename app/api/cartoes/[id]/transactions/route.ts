import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = { creditCardId: id };
    if (month && year) {
      where.dueDate = {
        gte: new Date(Number(year), Number(month) - 1, 1),
        lte: new Date(Number(year), Number(month), 0, 23, 59, 59),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar lançamentos do cartão" }, { status: 500 });
  }
}

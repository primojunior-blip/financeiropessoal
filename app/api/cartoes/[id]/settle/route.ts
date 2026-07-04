import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json({ error: "Mês e ano são obrigatórios" }, { status: 400 });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const result = await prisma.transaction.updateMany({
      where: {
        creditCardId: id,
        type: "payable",
        status: { in: ["pending", "overdue"] },
        dueDate: { gte: startDate, lte: endDate },
      },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    return NextResponse.json({ settled: result.count });
  } catch {
    return NextResponse.json({ error: "Erro ao liquidar cartão" }, { status: 500 });
  }
}

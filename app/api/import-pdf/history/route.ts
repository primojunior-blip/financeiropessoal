import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const imports = await prisma.creditCardImport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        transactions: {
          select: { id: true, amount: true, status: true, description: true, dueDate: true },
        },
      },
    });
    return NextResponse.json(imports);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 });
  }
}

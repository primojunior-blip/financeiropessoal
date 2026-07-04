import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

interface ConfirmTransaction {
  description: string;
  amount: number;
  date: string;
  category_hint?: string;
  categoryId?: string;
  creditCardId?: string;
  skip?: boolean;
  installment?: { current: number; total: number } | null;
  createAllInstallments?: boolean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { importId, transactions } = body as { importId: string; transactions: ConfirmTransaction[] };

    if (!importId || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const toCreate = transactions.filter(t => !t.skip);
    const toKeep = transactions.filter(t => t.skip);   // ainda pendentes
    const created: unknown[] = [];

    for (const t of toCreate) {
      const baseData = {
        description: t.description,
        amount: Number(t.amount),
        type: "payable" as const,
        categoryId: t.categoryId || null,
        creditCardId: t.creditCardId || null,
        importId,
        status: "pending",
        isFixed: false,
      };

      const hasInstallment = t.installment && t.installment.current && t.installment.total;

      if (hasInstallment && t.createAllInstallments) {
        const groupId = randomUUID();
        const current = t.installment!.current;
        const total = t.installment!.total;
        const baseDate = new Date(t.date);

        for (let i = 0; i < total - current + 1; i++) {
          const parcela = current + i;
          const dueDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
          const tx = await prisma.transaction.create({
            data: {
              ...baseData,
              description: `${t.description} ${parcela}/${total}`,
              dueDate,
              installmentCurrent: parcela,
              installmentTotal: total,
              installmentGroupId: groupId,
            },
          });
          created.push(tx);
        }
      } else {
        const tx = await prisma.transaction.create({
          data: {
            ...baseData,
            dueDate: new Date(t.date),
            installmentCurrent: hasInstallment ? t.installment!.current : null,
            installmentTotal: hasInstallment ? t.installment!.total : null,
          },
        });
        created.push(tx);
      }
    }

    // Se ainda há itens pendentes (skip=true), mantém o import aberto
    if (toKeep.length > 0) {
      await prisma.creditCardImport.update({
        where: { id: importId },
        data: {
          status: "pending_review",
          extractedData: JSON.stringify(toKeep),
        },
      });
    } else {
      await prisma.creditCardImport.update({
        where: { id: importId },
        data: { status: "completed", extractedData: null },
      });
    }

    return NextResponse.json({
      imported: created.length,
      remaining: toKeep.length,
      completed: toKeep.length === 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao confirmar importação" }, { status: 500 });
  }
}

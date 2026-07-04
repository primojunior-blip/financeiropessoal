import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const deleteTransactions = searchParams.get("transactions") === "true";

    if (deleteTransactions) {
      // Deleta os lançamentos vinculados a este import
      await prisma.transaction.deleteMany({ where: { importId: id } });
    } else {
      // Apenas desvincula (mantém os lançamentos, remove o vínculo)
      await prisma.transaction.updateMany({
        where: { importId: id },
        data: { importId: null },
      });
    }

    await prisma.creditCardImport.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir importação" }, { status: 500 });
  }
}

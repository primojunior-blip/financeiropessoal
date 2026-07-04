import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMessage, formatCurrencyBR, isLastBusinessDay } from "@/lib/telegram";

async function notifyToday() {
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const txs = await prisma.transaction.findMany({
    where: { dueDate: { gte: start, lte: end }, status: "pending" },
    include: { category: true },
    orderBy: { amount: "desc" },
  });

  if (txs.length === 0) return;

  const total = txs.reduce((s, t) => s + t.amount, 0);
  const lista = txs.map(t =>
    `• ${t.type === "payable" ? "💸" : "💰"} <b>${t.description}</b> — ${formatCurrencyBR(t.amount)}` +
    (t.category ? ` (${t.category.name})` : "")
  ).join("\n");

  await sendMessage(chatId,
    `🔔 <b>Vence HOJE — ${today.toLocaleDateString("pt-BR")}</b>\n\n${lista}\n\n` +
    `💸 Total: <b>${formatCurrencyBR(total)}</b>`
  );
}

async function notifyWeek() {
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 7);

  const txs = await prisma.transaction.findMany({
    where: { dueDate: { gte: today, lte: end }, status: "pending", type: "payable" },
    include: { category: true },
    orderBy: { dueDate: "asc" },
  });

  if (txs.length === 0) {
    await sendMessage(chatId, `✅ <b>Semana tranquila!</b> Nenhuma conta a vencer nos próximos 7 dias.`);
    return;
  }

  const total = txs.reduce((s, t) => s + t.amount, 0);
  const lista = txs.map(t =>
    `• ${t.dueDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })} — <b>${t.description}</b>: ${formatCurrencyBR(t.amount)}`
  ).join("\n");

  await sendMessage(chatId,
    `📅 <b>Contas da semana</b>\n\n${lista}\n\n💸 Total: <b>${formatCurrencyBR(total)}</b>`
  );
}

async function notifyMonth() {
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const month = nextMonth.getMonth() + 1;
  const year = nextMonth.getFullYear();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  // Garante que as contas fixas do próximo mês já estão geradas
  const fixedExpenses = await prisma.fixedExpense.findMany({ where: { isActive: true } });
  for (const fe of fixedExpenses) {
    const existing = await prisma.transaction.findFirst({
      where: { fixedExpenseId: fe.id, dueDate: { gte: start, lte: end } },
    });
    if (!existing) {
      const day = Math.min(fe.dayOfMonth, end.getDate());
      await prisma.transaction.create({
        data: {
          description: fe.description, amount: fe.amount, type: fe.type,
          dueDate: new Date(year, month - 1, day),
          categoryId: fe.categoryId, isFixed: true, fixedExpenseId: fe.id, status: "pending",
        },
      });
    }
  }

  const txs = await prisma.transaction.findMany({ where: { dueDate: { gte: start, lte: end } } });
  const totalPagar = txs.filter(t => t.type === "payable").reduce((s, t) => s + t.amount, 0);
  const totalReceber = txs.filter(t => t.type === "receivable").reduce((s, t) => s + t.amount, 0);
  const saldo = totalReceber - totalPagar;
  const contasFixas = txs.filter(t => t.isFixed).length;

  const mesLabel = nextMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  await sendMessage(chatId,
    `📆 <b>Planejamento — ${mesLabel}</b>\n\n` +
    `💸 Total a Pagar: <b>${formatCurrencyBR(totalPagar)}</b>\n` +
    `💰 Total a Receber: <b>${formatCurrencyBR(totalReceber)}</b>\n` +
    `📈 Saldo Projetado: <b>${saldo >= 0 ? "+" : ""}${formatCurrencyBR(saldo)}</b>\n` +
    `🔁 Contas Fixas: <b>${contasFixas}</b>\n\n` +
    `Acesse o sistema para detalhes e dar baixas.`
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const secret = searchParams.get("secret");

  if (secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return NextResponse.json({ error: "Telegram não configurado" }, { status: 400 });
  }

  try {
    if (type === "today") {
      await notifyToday();
    } else if (type === "week") {
      await notifyWeek();
    } else if (type === "month") {
      const today = new Date();
      if (isLastBusinessDay(today)) await notifyMonth();
      else return NextResponse.json({ skipped: "not last business day" });
    } else {
      return NextResponse.json({ error: "type must be today, week or month" }, { status: 400 });
    }
    return NextResponse.json({ sent: true, type });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao enviar notificação" }, { status: 500 });
  }
}

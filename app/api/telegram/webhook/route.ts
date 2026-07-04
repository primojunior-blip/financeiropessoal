import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/telegram";
import { processMessage } from "@/lib/claude-assistant";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { first_name?: string };
    text?: string;
  };
}

export async function POST(req: Request) {
  try {
    const update: TelegramUpdate = await req.json();
    const message = update.message;

    if (!message?.text || !message.chat.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const authorizedChatId = process.env.TELEGRAM_CHAT_ID;

    // Segurança: só aceita mensagens do chat autorizado
    if (authorizedChatId && chatId !== authorizedChatId) {
      await sendMessage(chatId, "❌ Acesso não autorizado.");
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const firstName = message.from?.first_name ?? "Dilson";

    // Comando /start
    if (text === "/start") {
      await sendMessage(chatId,
        `👋 Olá, <b>${firstName}</b>!\n\n` +
        `Sou seu assistente financeiro pessoal. Você pode me dizer coisas como:\n\n` +
        `💬 <i>"Comprei uma camisa por R$80 hoje"</i>\n` +
        `💬 <i>"Paguei o aluguel"</i>\n` +
        `💬 <i>"Como estão minhas finanças esse mês?"</i>\n` +
        `💬 <i>"O que vence essa semana?"</i>\n` +
        `💬 <i>"Adiciona Netflix R$55 todo dia 15"</i>\n\n` +
        `📋 <b>Comandos:</b>\n` +
        `/saldo — Resumo do mês\n` +
        `/semana — Vencimentos da semana\n` +
        `/hoje — Vence hoje\n` +
        `/ajuda — Ver exemplos`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/saldo") {
      const reply = await processMessage("Mostre meu resumo financeiro desse mês");
      await sendMessage(chatId, reply, "Markdown");
      return NextResponse.json({ ok: true });
    }

    if (text === "/semana") {
      const reply = await processMessage("Quais contas vencem nos próximos 7 dias?");
      await sendMessage(chatId, reply, "Markdown");
      return NextResponse.json({ ok: true });
    }

    if (text === "/hoje") {
      const reply = await processMessage("Quais contas vencem hoje?");
      await sendMessage(chatId, reply, "Markdown");
      return NextResponse.json({ ok: true });
    }

    if (text === "/ajuda") {
      await sendMessage(chatId,
        `🤖 <b>Exemplos de comandos:</b>\n\n` +
        `<b>Criar lançamento:</b>\n` +
        `• "Comprei tênis por R$250 no Nubank"\n` +
        `• "Recebi salário de R$5000 hoje"\n` +
        `• "Mercado R$180 ontem no cartão Itaú"\n\n` +
        `<b>Dar baixa:</b>\n` +
        `• "Paguei o aluguel"\n` +
        `• "Recebi o freelance"\n` +
        `• "Quitei a internet"\n\n` +
        `<b>Consultas:</b>\n` +
        `• "Como estão minhas finanças?"\n` +
        `• "O que vence essa semana?"\n` +
        `• "Qual meu saldo projetado?"\n\n` +
        `<b>Contas fixas:</b>\n` +
        `• "Adiciona Netflix R$55 todo dia 15"\n` +
        `• "Cadastra aluguel R$1500 todo dia 5"`
      );
      return NextResponse.json({ ok: true });
    }

    // Processa mensagem livre com Claude
    await sendMessage(chatId, "⏳ Processando...");
    const reply = await processMessage(text);
    await sendMessage(chatId, reply, "Markdown");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram/webhook]", err);
    return NextResponse.json({ ok: true }); // sempre 200 para o Telegram não reenviar
  }
}

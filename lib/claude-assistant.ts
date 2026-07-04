import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";
import { formatCurrencyBR } from "@/lib/telegram";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Definição das ferramentas disponíveis para o assistente ──────────────────
const tools: Anthropic.Tool[] = [
  {
    name: "criar_lancamento",
    description: "Cria um novo lançamento financeiro (despesa ou receita) no sistema",
    input_schema: {
      type: "object" as const,
      properties: {
        descricao: { type: "string", description: "Nome do estabelecimento ou descrição" },
        valor: { type: "number", description: "Valor em reais (número positivo)" },
        tipo: { type: "string", enum: ["payable", "receivable"], description: "payable=despesa, receivable=receita" },
        data_vencimento: { type: "string", description: "Data no formato YYYY-MM-DD. Se não informado, use hoje." },
        nome_categoria: { type: "string", description: "Nome aproximado da categoria (opcional)" },
        nome_cartao: { type: "string", description: "Nome aproximado do cartão de crédito (opcional)" },
      },
      required: ["descricao", "valor", "tipo", "data_vencimento"],
    },
  },
  {
    name: "dar_baixa",
    description: "Marca uma conta como paga ou recebida. Busca por nome aproximado.",
    input_schema: {
      type: "object" as const,
      properties: {
        descricao: { type: "string", description: "Parte do nome da conta a ser quitada" },
        valor: { type: "number", description: "Valor para ajudar a identificar (opcional)" },
      },
      required: ["descricao"],
    },
  },
  {
    name: "consultar_saldo",
    description: "Retorna resumo financeiro do mês atual: total a pagar, a receber e saldo projetado",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "listar_vencimentos",
    description: "Lista contas pendentes a vencer nos próximos X dias",
    input_schema: {
      type: "object" as const,
      properties: {
        dias: { type: "number", description: "Quantidade de dias à frente. Ex: 7 = próxima semana" },
      },
      required: ["dias"],
    },
  },
  {
    name: "criar_conta_fixa",
    description: "Cadastra uma nova conta fixa recorrente mensal",
    input_schema: {
      type: "object" as const,
      properties: {
        descricao: { type: "string" },
        valor: { type: "number" },
        tipo: { type: "string", enum: ["payable", "receivable"] },
        dia_vencimento: { type: "number", description: "Dia do mês que vence (1-28)" },
        nome_categoria: { type: "string" },
      },
      required: ["descricao", "valor", "tipo", "dia_vencimento"],
    },
  },
];

// ── Executores de ferramentas ─────────────────────────────────────────────────
async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  const today = new Date();

  if (name === "criar_lancamento") {
    const { descricao, valor, tipo, data_vencimento, nome_categoria, nome_cartao } = input as {
      descricao: string; valor: number; tipo: string; data_vencimento: string;
      nome_categoria?: string; nome_cartao?: string;
    };

    let categoryId: string | null = null;
    if (nome_categoria) {
      const cat = await prisma.category.findFirst({ where: { name: { contains: nome_categoria } } });
      categoryId = cat?.id ?? null;
    }

    let creditCardId: string | null = null;
    if (nome_cartao) {
      const card = await prisma.creditCard.findFirst({ where: { name: { contains: nome_cartao } } });
      creditCardId = card?.id ?? null;
    }

    await prisma.transaction.create({
      data: {
        description: descricao,
        amount: valor,
        type: tipo,
        dueDate: new Date(data_vencimento),
        categoryId,
        creditCardId,
        status: "pending",
        isFixed: false,
      },
    });

    return `✅ Lançamento criado: *${descricao}* — ${formatCurrencyBR(valor)} com vencimento em ${new Date(data_vencimento).toLocaleDateString("pt-BR")}`;
  }

  if (name === "dar_baixa") {
    const { descricao, valor } = input as { descricao: string; valor?: number };

    const where: Record<string, unknown> = {
      description: { contains: descricao },
      status: "pending",
    };
    if (valor) where.amount = { gte: valor * 0.9, lte: valor * 1.1 };

    const tx = await prisma.transaction.findFirst({ where, orderBy: { dueDate: "asc" } });
    if (!tx) return `❌ Nenhuma conta pendente encontrada com "${descricao}"`;

    const newStatus = tx.type === "payable" ? "paid" : "received";
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: newStatus, paidAt: today },
    });

    return `✅ Baixa dada: *${tx.description}* — ${formatCurrencyBR(tx.amount)} marcado como ${newStatus === "paid" ? "pago" : "recebido"}`;
  }

  if (name === "consultar_saldo") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    const txs = await prisma.transaction.findMany({ where: { dueDate: { gte: start, lte: end } } });

    const totalPagar = txs.filter(t => t.type === "payable").reduce((s, t) => s + t.amount, 0);
    const totalReceber = txs.filter(t => t.type === "receivable").reduce((s, t) => s + t.amount, 0);
    const pago = txs.filter(t => t.status === "paid").reduce((s, t) => s + t.amount, 0);
    const recebido = txs.filter(t => t.status === "received").reduce((s, t) => s + t.amount, 0);
    const saldo = totalReceber - totalPagar;

    const mes = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return `📊 *Resumo de ${mes}*\n\n` +
      `💸 A Pagar: ${formatCurrencyBR(totalPagar)} (${formatCurrencyBR(pago)} pago)\n` +
      `💰 A Receber: ${formatCurrencyBR(totalReceber)} (${formatCurrencyBR(recebido)} recebido)\n` +
      `📈 Saldo Projetado: ${saldo >= 0 ? "+" : ""}${formatCurrencyBR(saldo)}`;
  }

  if (name === "listar_vencimentos") {
    const { dias } = input as { dias: number };
    const end = new Date(today);
    end.setDate(end.getDate() + dias);

    const txs = await prisma.transaction.findMany({
      where: { dueDate: { gte: today, lte: end }, status: "pending" },
      orderBy: { dueDate: "asc" },
      take: 15,
    });

    if (txs.length === 0) return `✅ Nenhuma conta a vencer nos próximos ${dias} dias.`;

    const total = txs.reduce((s, t) => s + t.amount, 0);
    const lista = txs.map(t =>
      `• ${t.dueDate.toLocaleDateString("pt-BR")} — ${t.description}: ${formatCurrencyBR(t.amount)}`
    ).join("\n");

    return `📅 *Vencimentos nos próximos ${dias} dias:*\n\n${lista}\n\n💸 Total: ${formatCurrencyBR(total)}`;
  }

  if (name === "criar_conta_fixa") {
    const { descricao, valor, tipo, dia_vencimento, nome_categoria } = input as {
      descricao: string; valor: number; tipo: string; dia_vencimento: number; nome_categoria?: string;
    };

    let categoryId: string | null = null;
    if (nome_categoria) {
      const cat = await prisma.category.findFirst({ where: { name: { contains: nome_categoria } } });
      categoryId = cat?.id ?? null;
    }

    const fe = await prisma.fixedExpense.create({
      data: { description: descricao, amount: valor, type: tipo, dayOfMonth: dia_vencimento, categoryId, isActive: true },
    });

    // Gera lançamento para o mês atual
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const day = Math.min(dia_vencimento, endDate.getDate());
    await prisma.transaction.create({
      data: {
        description: descricao, amount: valor, type: tipo,
        dueDate: new Date(today.getFullYear(), today.getMonth(), day),
        categoryId, isFixed: true, fixedExpenseId: fe.id, status: "pending",
      },
    });

    return `✅ Conta fixa criada: *${descricao}* — ${formatCurrencyBR(valor)}/mês todo dia ${dia_vencimento}`;
  }

  return "❌ Ferramenta desconhecida";
}

// ── Processador principal ─────────────────────────────────────────────────────
export async function processMessage(userMessage: string): Promise<string> {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: userMessage,
    },
  ];

  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `Você é um assistente financeiro pessoal integrado ao sistema financeiro do usuário. Hoje é ${today}.

Você pode executar ações reais no sistema usando as ferramentas disponíveis. Responda sempre em português brasileiro, de forma concisa e amigável.

Ao criar lançamentos:
- Se não informar tipo, assuma "payable" (despesa) para compras
- Se mencionar cartão, tente identificar pelo nome
- Se não informar data, use hoje
- Confirme sempre o que foi feito com um resumo

Responda de forma curta e direta. Use emoji para facilitar a leitura.`,
    tools,
    messages,
  });

  // Processa tool_use em loop até não ter mais chamadas
  while (response.stop_reason === "tool_use") {
    const toolUses = response.content.filter(b => b.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUses) {
      if (toolUse.type !== "tool_use") continue;
      const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);
      toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result });
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `Você é um assistente financeiro pessoal. Hoje é ${today}. Responda em português, de forma concisa. Use emoji.`,
      tools,
      messages,
    });
  }

  const textBlock = response.content.find(b => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "Não entendi. Tente novamente.";
}

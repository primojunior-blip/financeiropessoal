import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const ACCEPTED_TYPES: Record<string, "image/jpeg" | "image/png" | "image/gif" | "image/webp"> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/gif": "image/gif",
  "image/webp": "image/webp",
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const month = formData.get("month") as string;
    const year = formData.get("year") as string;

    if (!file) {
      return NextResponse.json({ error: "Imagem não enviada" }, { status: 400 });
    }

    const mediaType = ACCEPTED_TYPES[file.type.toLowerCase()];
    if (!mediaType) {
      return NextResponse.json(
        { error: "Formato não suportado. Use JPG, PNG ou WEBP." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: "You are a JSON-only API. Respond with valid JSON only — no explanations, no markdown, no text before or after the JSON.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Esta imagem é um print/screenshot de uma fatura de cartão de crédito ou extrato bancário.
Extraia todos os lançamentos/compras e retorne SOMENTE este JSON:

{"transactions":[{"description":"NOME DO ESTABELECIMENTO","amount":150.00,"date":"${year}-${String(month).padStart(2,"0")}-01","category_hint":"alimentação","installment":{"current":3,"total":12}}]}

Para lançamentos sem parcelamento, omita o campo "installment" ou coloque null.

Regras:
- Inclua TODOS os lançamentos individuais visíveis
- Exclua: totais, saldos, pagamento mínimo, juros, encargos, estornos
- amount: valor da parcela (número decimal positivo, ex: R$ 1.250,90 → 1250.90)
- date: YYYY-MM-DD. Se não aparecer o ano, use ${year}. Se não aparecer o mês, use ${String(month).padStart(2,"0")}/${year}
- category_hint: alimentação, transporte, saúde, lazer, educação, moradia, ou outros
- Parcelas: detecte padrões como "3/12", "03/12", "PARC 3/12", "03 DE 12"
  - current: número da parcela atual
  - total: total de parcelas
- Se não encontrar lançamentos: {"transactions":[]}`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    console.log("[import] Claude raw (first 400):", responseText.substring(0, 400));

    if (!responseText) {
      return NextResponse.json({ error: "A IA não retornou resposta. Tente novamente." }, { status: 500 });
    }

    type ParsedType = { transactions: Array<{ description: string; amount: number; date: string; category_hint: string; installment?: { current: number; total: number } | null }> };
    let parsed: ParsedType | null = null;

    const candidates = [responseText];
    const mdBlock = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (mdBlock) candidates.push(mdBlock[1].trim());
    const f = responseText.indexOf("{"), l = responseText.lastIndexOf("}");
    if (f !== -1 && l > f) candidates.push(responseText.substring(f, l + 1));

    for (const c of candidates) {
      try { parsed = JSON.parse(c) as ParsedType; break; } catch { /* next */ }
    }

    if (!parsed) {
      console.error("[import] Parse failed. Raw:", responseText.substring(0, 800));
      return NextResponse.json({ error: "Não foi possível interpretar a resposta da IA. Tente novamente." }, { status: 500 });
    }

    if (!Array.isArray(parsed.transactions) || parsed.transactions.length === 0) {
      return NextResponse.json({ error: "Nenhum lançamento encontrado na imagem. Verifique se é um print de fatura ou extrato." }, { status: 422 });
    }

    const transactions = parsed.transactions;

    const importRecord = await prisma.creditCardImport.create({
      data: {
        filename: file.name,
        month: Number(month),
        year: Number(year),
        status: "pending_review",
        extractedData: JSON.stringify(transactions),
      },
    });

    return NextResponse.json({ importId: importRecord.id, transactions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao processar imagem" }, { status: 500 });
  }
}

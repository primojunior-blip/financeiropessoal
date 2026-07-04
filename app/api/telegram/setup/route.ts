import { NextResponse } from "next/server";
import { setWebhook, getWebhookInfo, deleteWebhook } from "@/lib/telegram";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "info";

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN não configurado" }, { status: 400 });
  }

  if (action === "info") {
    const info = await getWebhookInfo();
    return NextResponse.json(info);
  }

  if (action === "set") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL não configurado" }, { status: 400 });
    const webhookUrl = `${appUrl}/api/telegram/webhook`;
    const result = await setWebhook(webhookUrl);
    return NextResponse.json({ webhookUrl, result });
  }

  if (action === "delete") {
    const result = await deleteWebhook();
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "action must be info, set or delete" }, { status: 400 });
}

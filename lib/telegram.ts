const BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendMessage(chatId: string, text: string, parseMode: "HTML" | "Markdown" = "HTML") {
  const res = await fetch(`${BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
  return res.json();
}

export async function setWebhook(url: string) {
  const res = await fetch(`${BASE}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, allowed_updates: ["message"] }),
  });
  return res.json();
}

export async function getWebhookInfo() {
  const res = await fetch(`${BASE}/getWebhookInfo`);
  return res.json();
}

export async function deleteWebhook() {
  const res = await fetch(`${BASE}/deleteWebhook`, { method: "POST" });
  return res.json();
}

export function formatCurrencyBR(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function isLastBusinessDay(date: Date): boolean {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  let candidate = lastDay;
  while (candidate.getDay() === 0 || candidate.getDay() === 6) {
    candidate = new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate() - 1);
  }
  return date.getDate() === candidate.getDate();
}

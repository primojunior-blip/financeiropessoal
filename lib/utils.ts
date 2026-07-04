export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

export function formatDateInput(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    received: "Recebido",
    overdue: "Atrasado",
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20",
    paid: "text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20",
    received: "text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20",
    overdue: "text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20",
  };
  return colors[status] ?? "text-[#94a3b8]";
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

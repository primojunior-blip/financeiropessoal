"use client";

import { useState, useEffect } from "react";
import { formatDateInput } from "@/lib/utils";
import CategorySelect from "@/components/CategorySelect";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  dueDate: string;
  categoryId?: string | null;
  notes?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  type: "payable" | "receivable";
  transaction?: Transaction | null;
}

export default function TransactionModal({ open, onClose, onSave, type, transaction }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    notes: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description,
        amount: String(transaction.amount),
        dueDate: formatDateInput(transaction.dueDate),
        categoryId: transaction.categoryId ?? "",
        notes: transaction.notes ?? "",
        status: transaction.status,
      });
    } else {
      setForm({ description: "", amount: "", dueDate: new Date().toISOString().split("T")[0], categoryId: "", notes: "", status: "pending" });
    }
  }, [transaction, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = transaction ? `/api/transactions/${transaction.id}` : "/api/transactions";
      const method = transaction ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type, amount: Number(form.amount) }),
      });
      onSave();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const typeLabel = type === "payable" ? "Pagar" : "Receber";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2d3e]">
          <h2 className="text-base font-semibold text-[#e2e8f0]">
            {transaction ? "Editar" : "Nova"} Conta a {typeLabel}
          </h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider block mb-1.5">Descrição *</label>
            <input
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Aluguel, Salário..."
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#94a3b8] focus:outline-none focus:border-[#22c55e] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider block mb-1.5">Valor (R$) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0,00"
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#94a3b8] focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider block mb-1.5">Vencimento *</label>
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider block mb-1.5">Categoria</label>
              <CategorySelect
                categories={categories}
                value={form.categoryId}
                onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                filterType={type === "payable" ? "expense" : "income"}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider block mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#22c55e] transition-colors"
              >
                <option value="pending">Pendente</option>
                {type === "payable" ? (
                  <option value="paid">Pago</option>
                ) : (
                  <option value="received">Recebido</option>
                )}
                <option value="overdue">Atrasado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider block mb-1.5">Observações</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Opcional..."
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#94a3b8] focus:outline-none focus:border-[#22c55e] transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[#94a3b8] border border-[#2a2d3e] rounded-lg hover:bg-[#222640] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

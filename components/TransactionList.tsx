"use client";

import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

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
  category?: Category | null;
}

interface Props {
  transactions: Transaction[];
  type: "payable" | "receivable";
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export default function TransactionList({ transactions, type, onEdit, onDelete, onStatusChange }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-[#94a3b8]">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">Nenhum lançamento encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1a1d2e] border border-[#2a2d3e] hover:border-[#22c55e]/20 transition-all group"
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: t.category?.color ?? "#94a3b8" }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[#e2e8f0] truncate">{t.description}</p>
              {t.notes && (
                <span title={t.notes}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[#94a3b8]">
                {t.category?.name ?? "Sem categoria"} · Venc. {formatDate(t.dueDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(t.status)}`}>
              {getStatusLabel(t.status)}
            </span>

            <span className={`text-sm font-bold ${type === "receivable" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              {formatCurrency(t.amount)}
            </span>

            {/* Quick actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {t.status === "pending" && (
                <button
                  onClick={() => onStatusChange(t.id, type === "payable" ? "paid" : "received")}
                  className="w-7 h-7 rounded-lg bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center transition-colors"
                  title="Marcar como pago"
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onEdit(t)}
                className="w-7 h-7 rounded-lg bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center transition-colors"
                title="Editar"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="w-7 h-7 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] flex items-center justify-center transition-colors"
                title="Deletar"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

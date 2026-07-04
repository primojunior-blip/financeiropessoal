"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao fazer login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#22c55e] flex items-center justify-center mb-4 shadow-lg shadow-[#22c55e]/20">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#e2e8f0]">Financeiro Pessoal</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Entre para acessar seu painel</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider block mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="seu@email.com"
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-sm text-[#e2e8f0] placeholder-[#94a3b8] focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider block mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••"
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-sm text-[#e2e8f0] placeholder-[#94a3b8] focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#94a3b8] mt-6">
          Acesso restrito · Uso pessoal
        </p>
      </div>
    </div>
  );
}

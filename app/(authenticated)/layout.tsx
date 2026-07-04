"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/lancamentos", label: "Lançamentos", icon: "📝" },
  { href: "/contas-pagar", label: "Contas a Pagar", icon: "💳" },
  { href: "/contas-receber", label: "Contas a Receber", icon: "💰" },
  { href: "/cartoes", label: "Cartões", icon: "🏦" },
  { href: "/contas-fixas", label: "Contas Fixas", icon: "🔄" },
  { href: "/categorias", label: "Categorias", icon: "🏷️" },
  { href: "/orcamento", label: "Orçamento", icon: "📈" },
  { href: "/importar-pdf", label: "Importar PDF", icon: "📄" },
];

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[#0f1117]">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-[#1a1d2e] border-r border-[#2a2d3e] transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#22c55e] flex items-center justify-center text-white font-bold">
              💰
            </div>
            {sidebarOpen && (
              <h1 className="text-lg font-bold text-[#e2e8f0]">Financeiro</h1>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-[#22c55e] text-white"
                  : "text-[#94a3b8] hover:bg-[#2a2d3e]"
              }`}
              title={!sidebarOpen ? item.label : ""}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#2a2d3e] p-4 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-[#94a3b8] hover:bg-[#2a2d3e] rounded-lg transition-colors"
            title={sidebarOpen ? "Recolher" : "Expandir"}
          >
            {sidebarOpen ? "«" : "»"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#ef4444]/10 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/20 transition-colors text-sm font-medium"
          >
            <span>🚪</span>
            {sidebarOpen && "Sair"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a1d2e] border-b border-[#2a2d3e] px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#e2e8f0] font-semibold text-lg">
              Financeiro Pessoal
            </h2>
            <div className="text-[#94a3b8] text-sm">
              {new Date().toLocaleDateString("pt-BR")}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#0f1117]">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const title = "$page".replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#e2e8f0] mb-6">{title}</h1>
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl p-6">
        <p className="text-[#94a3b8]">Página em desenvolvimento...</p>
      </div>
    </div>
  );
}

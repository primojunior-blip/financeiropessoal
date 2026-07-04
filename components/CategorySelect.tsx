interface Category {
  id: string;
  name: string;
  type?: string;
  color?: string;
}

interface Props {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  filterType?: "expense" | "income" | "both" | null; // null = mostra todos
}

export default function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = "Sem categoria",
  className = "",
  filterType = null,
}: Props) {
  const filtered = filterType
    ? categories.filter(c => c.type === filterType || c.type === "both")
    : categories;

  const expenses = filtered.filter(c => c.type === "expense");
  const incomes = filtered.filter(c => c.type === "income");
  const both = filtered.filter(c => c.type === "both");

  const baseClass =
    "bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#22c55e] transition-colors";

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${baseClass} ${className}`}
    >
      <option value="">{placeholder}</option>

      {expenses.length > 0 && (
        <optgroup label="── Despesas">
          {expenses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </optgroup>
      )}

      {incomes.length > 0 && (
        <optgroup label="── Receitas">
          {incomes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </optgroup>
      )}

      {both.length > 0 && (
        <optgroup label="── Ambos">
          {both.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </optgroup>
      )}
    </select>
  );
}

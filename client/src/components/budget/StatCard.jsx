export default function StatCard({ label, value, accent = 'text-ink' }) {
  return (
    <div className="bg-white border border-ink px-5 py-4 shadow-[3px_3px_0px_0px_#1F2B2E]">
      <p className="text-[10px] font-mono uppercase tracking-widest text-ink/50 mb-1">{label}</p>
      <p className={`text-3xl font-mono font-bold ${accent}`}>{value}</p>
    </div>
  );
}

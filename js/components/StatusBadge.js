// StatusBadge component
function StatusBadge({ status, portions }) {
  if (status === 'soldout') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-900/70 text-red-300 border border-red-700/50">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>Sold Out
    </span>
  );
  if (status === 'low') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-900/70 text-amber-300 border border-amber-700/50 animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>Only {portions} left
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>In Stock
    </span>
  );
}

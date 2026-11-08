export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-700 to-orange-600 py-3.5 text-orange-50">
      <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-lg font-medium whitespace-nowrap md:text-xl">
            {t}
            <span className="text-amber-300">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

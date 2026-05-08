export default function TypeBadge({ type }) {
  if (type === "VIDEO")
    return (
      <span className="absolute top-2 right-2 bg-white/85 text-[10px] font-semibold text-[color:var(--color-text-dark)] px-1.5 py-0.5 rounded flex items-center gap-1">
        ▶ video
      </span>
    );
  if (type === "CAROUSEL_ALBUM")
    return (
      <span className="absolute top-2 right-2 bg-white/85 text-[10px] font-semibold text-[color:var(--color-text-dark)] px-1.5 py-0.5 rounded flex items-center gap-1">
        ⊞ álbum
      </span>
    );
  return null;
}

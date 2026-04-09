"use client";

export function FavoriteButton({
  isFavorite,
  onToggle,
}: {
  isFavorite: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle();
      }}
      className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-all animate-pop-in"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={isFavorite ? "#E8C84A" : "none"}
        stroke={isFavorite ? "#E8C84A" : "rgba(107,114,128,0.5)"}
        strokeWidth="2"
        className={`transition-all ${isFavorite ? "drop-shadow-[0_0_4px_rgba(232,200,74,0.5)]" : "hover:stroke-cyber-yellow"}`}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}

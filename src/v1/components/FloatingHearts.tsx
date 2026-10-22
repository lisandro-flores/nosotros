import { useMemo } from "react";
import { Heart, Star } from "lucide-react";

/**
 * Fondo decorativo: corazones y estrellas flotando muy sutilmente.
 * Es `pointer-events-none` para no estorbar los toques en móvil.
 */
export default function FloatingHearts({ count = 14 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 12 + Math.random() * 20,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 6,
        star: i % 4 === 0,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      {items.map((it) => {
        const Icon = it.star ? Star : Heart;
        return (
          <Icon
            key={it.id}
            className={`absolute animate-float ${
              it.star ? "text-amber-400/20" : "text-rose-500/15"
            }`}
            fill="currentColor"
            strokeWidth={0}
            style={{
              left: `${it.left}%`,
              top: `${it.top}%`,
              width: it.size,
              height: it.size,
              animationDelay: `${it.delay}s`,
              animationDuration: `${it.duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}


import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Sparkles, X } from "lucide-react";
import { CONTENT } from "../content";

const COLORS = ["#f43f5e", "#fb7185", "#fbbf24", "#fde68a", "#ffffff"];

/** Lluvia de confeti por toda la pantalla (explosión central + cañones laterales). */
function fireConfetti() {
  const base = { zIndex: 200, colors: COLORS, disableForReducedMotion: true };

  // Explosión inicial en el centro
  confetti({ ...base, particleCount: 140, spread: 100, startVelocity: 45, origin: { y: 0.65 } });

  // Corazones (emoji convertido en forma de confeti)
  const heart = confetti.shapeFromText({ text: "❤️", scalar: 2 });
  confetti({
    ...base,
    particleCount: 30,
    spread: 120,
    scalar: 2,
    shapes: [heart],
    origin: { y: 0.7 },
  });

  // Cañones laterales durante ~3 segundos
  const end = Date.now() + 3000;
  (function frame() {
    confetti({ ...base, particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } });
    confetti({ ...base, particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Sección final: la pregunta + botones + modal de respuesta. */
export default function Question() {
  const { encabezado, pregunta, botonSi, botonPensar, frasesPensar } = CONTENT.pregunta;
  const final = CONTENT.final;

  const [accepted, setAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // -1 = texto original; 0..n-1 = índice de la frase tierna actual
  const [thinkIdx, setThinkIdx] = useState(-1);
  const [taps, setTaps] = useState(0);

  const handleYes = useCallback(() => {
    setAccepted(true);
    setShowModal(true);
    fireConfetti();
  }, []);

  const handleThink = () => {
    // Cicla por las frases y vuelve al texto original al terminar
    setThinkIdx((i) => (i + 1 >= frasesPensar.length ? -1 : i + 1));
    setTaps((t) => t + 1);
    navigator.vibrate?.(30); // pequeña vibración en móviles compatibles
  };

  // Cerrar modal con Escape
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const thinkLabel = thinkIdx === -1 ? botonPensar : frasesPensar[thinkIdx];
  // El botón "Sí" crece un poquito con cada intento de "Pensarlo" (máx. 1.25x)
  const yesScale = Math.min(1 + taps * 0.05, 1.25);

  return (
    <section className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9 }}
        className="flex flex-col items-center"
      >
        <Heart className="mb-6 h-12 w-12 animate-pulse text-rose-500" fill="currentColor" strokeWidth={0} aria-hidden />

        <p className="font-serif text-lg leading-relaxed text-slate-300 italic">{encabezado}</p>

        <h2 className="mt-8 font-serif text-3xl leading-snug font-bold text-amber-300 sm:text-4xl">
          {pregunta}
        </h2>

        <div className="mt-12 flex w-full flex-col items-center gap-4">
          <motion.button
            type="button"
            onClick={handleYes}
            animate={{ scale: yesScale }}
            whileTap={{ scale: yesScale * 0.95 }}
            className="min-h-14 w-full animate-pulse-glow rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-900/40"
          >
            {botonSi}
          </motion.button>

          {/* Botón juguetón: desaparece cuando ya aceptó */}
          {!accepted && (
            <motion.button
              type="button"
              onClick={handleThink}
              whileTap={{ scale: 0.95 }}
              className="min-h-12 w-full rounded-full border border-slate-600 bg-slate-800/60 px-6 py-3 text-base text-slate-300 transition-colors active:bg-slate-700"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={thinkLabel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="inline-block"
                >
                  {thinkLabel}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Modal final */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="final-title"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 18, stiffness: 180 }}
              className="relative w-full max-w-sm rounded-3xl border border-rose-400/30 bg-gradient-to-b from-slate-800 to-rose-950 p-8 text-center shadow-2xl shadow-rose-900/50"
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label={final.botonCerrar}
                className="absolute top-3 right-3 rounded-full p-2 text-slate-400 active:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>

              <Sparkles className="mx-auto mb-3 h-8 w-8 text-amber-400" aria-hidden />
              <h3 id="final-title" className="font-script text-4xl text-amber-300">
                {final.titulo}
              </h3>
              <p className="mt-4 font-serif text-lg leading-relaxed text-slate-100">{final.mensaje}</p>
              <Heart className="mx-auto mt-6 h-8 w-8 animate-pulse text-rose-500" fill="currentColor" strokeWidth={0} aria-hidden />

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-6 min-h-12 rounded-full bg-white/10 px-8 py-3 text-sm text-slate-200 active:bg-white/20"
              >
                {final.botonCerrar}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


import { motion } from "framer-motion";
import { Heart, Music } from "lucide-react";
import { CONTENT } from "../content";

interface SplashProps {
  onOpen: () => void;
}

/** Pantalla de bienvenida a pantalla completa. El clic también inicia la música. */
export default function Splash({ onOpen }: SplashProps) {
  const { paraQuien, mensaje, boton } = CONTENT.splash;

  return (
    <motion.div
      key="splash"
      className="fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950 px-8 text-center"
      exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    >
      {/* Resplandores de fondo */}
      <div aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
      <div aria-hidden className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative mb-8"
      >
        <Heart className="h-16 w-16 animate-pulse text-rose-500" fill="currentColor" strokeWidth={0} />
        <div aria-hidden className="absolute inset-0 -z-10 rounded-full bg-rose-500/40 blur-2xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mb-3 font-script text-3xl text-amber-400"
      >
        {paraQuien}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.9 }}
        className="max-w-xs font-serif text-3xl leading-snug font-medium text-slate-50 sm:max-w-md sm:text-4xl"
      >
        {mensaje}
      </motion.h1>

      <motion.button
        type="button"
        onClick={onOpen}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        whileTap={{ scale: 0.95 }}
        className="relative mt-12 inline-flex min-h-14 animate-pulse-glow items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-rose-900/40"
      >
        <Music className="h-5 w-5" aria-hidden />
        {boton}
      </motion.button>
    </motion.div>
  );
}


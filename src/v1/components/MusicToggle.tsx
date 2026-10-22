import { motion } from "framer-motion";
import { Music, VolumeX } from "lucide-react";

interface MusicToggleProps {
  playing: boolean;
  onToggle: () => void;
}

/** Botón flotante y sutil para pausar / reanudar la canción. */
export default function MusicToggle({ playing, onToggle }: MusicToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Pausar música" : "Reproducir música"}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      className="fixed top-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-800/70 text-amber-400 backdrop-blur-md active:scale-95"
      style={{ top: "max(1rem, env(safe-area-inset-top))" }}
    >
      {playing ? <Music className="h-5 w-5 animate-pulse" /> : <VolumeX className="h-5 w-5" />}
    </motion.button>
  );
}


import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { CONTENT } from "./content";
import FloatingHearts from "./components/FloatingHearts";
import Splash from "./components/Splash";
import Letter from "./components/Letter";
import Gallery from "./components/Gallery";
import Question from "./components/Question";
import MusicToggle from "./components/MusicToggle";

export default function App() {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Bloquea el scroll mientras se ve la pantalla de bienvenida
  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  // Pausa la música si cierra/oculta la pestaña
  useEffect(() => {
    const onHide = () => document.hidden && audioRef.current?.pause();
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  /** El clic en "Abrir nuestra historia" es el gesto del usuario que permite iniciar el audio. */
  const handleOpen = async () => {
    setOpened(true);
    window.scrollTo({ top: 0 });

    const audio = new Audio(CONTENT.audio.src);
    audio.loop = true;
    audio.volume = CONTENT.audio.volumen;
    audioRef.current = audio;
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));

    try {
      await audio.play();
      setHasAudio(true);
    } catch {
      // No hay MP3 o el navegador lo bloqueó: la página sigue funcionando sin música
      setHasAudio(false);
    }
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  return (
    // reducedMotion="user": respeta la preferencia de "reducir movimiento" del sistema
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-dvh bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/60">
        <FloatingHearts />

        <AnimatePresence>{!opened && <Splash onOpen={handleOpen} />}</AnimatePresence>

        {opened && (
          <>
            {hasAudio && <MusicToggle playing={playing} onToggle={toggleMusic} />}
            <Letter />
            <Gallery />
            <Question />
            <footer className="relative z-10 pb-10 text-center text-xs text-slate-500">
              {/* ESCRIBIR TEXTO AQUÍ (opcional): frase o fecha de pie de página */}
              Hecho con ❤️ solo para ti
            </footer>
          </>
        )}
      </main>
    </MotionConfig>
  );
}


import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "motion/react";
import { ArrowLeft, Camera, ChevronLeft, ChevronRight, Heart, Quote, Sparkles, Volume2, VolumeX, X } from "lucide-react";

/* =====================================================================
 *  💌  CARTA DIGITAL — TODO EN UN SOLO ARCHIVO
 *
 *  Archivos que debes colocar en la carpeta /public:
 *    /foto1.webp … /foto4.webp   ← las 4 fotos de la galería
 *
 *  Busca estos marcadores para personalizar:
 *    // MODO_CANCION   → alterna la canción con una sola variable
 *    // MI CARTA AQUÍ  → tus palabras
 *    // CAMBIAR FOTO AQUÍ / ESCRIBIR PIE DE FOTO AQUÍ → galería
 * ===================================================================== */

/* ---------------------------------------------------------------------
 *  🎵 MÚSICA AMBIENTAL DE FONDO (CANCIÓN COMPLETA, SIN PREVIEWS)
 *  Integramos las 2 canciones completas que pusiste en Spotify
 *  para que suenen 100% de fondo sin cortes ni widgets:
 *  - 'CHIPINQUE' : "Cerraron Chipinque - José Madero" (/chipinque.mp3)
 *  - 'AFLICCION' : "Nuestra Aflicción - PXNDX" (/afliccion.mp3)
 * ------------------------------------------------------------------- */
type ModoCancion = "CHIPINQUE" | "AFLICCION";

const MODO_CANCION: ModoCancion = "CHIPINQUE"; // ← CAMBIAR AQUÍ: 'CHIPINQUE' | 'AFLICCION'

interface CancionAmbiental {
  src: string;
  titulo: string;
  cita: string;
  autor: string;
  segundoInicio: number;
}

const CANCIONES: Record<ModoCancion, CancionAmbiental> = {
  CHIPINQUE: {
    src: "/chipinque.mp3",
    titulo: "Cerraron Chipinque - José Madero",
    cita: "Y si se acaba el mundo hoy, qué bueno que contigo estoy.",
    autor: "José Madero",
    segundoInicio: 0,
  },
  AFLICCION: {
    src: "/afliccion.mp3",
    titulo: "Nuestra Aflicción - PXNDX",
    cita: "Mírame a los ojos, no, no hay que llorar... ahora todo estará bien, por siempre estaré junto a ti.",
    autor: "PXNDX",
    segundoInicio: 0, // Inicia desde el principio (o 198 si prefieres el clímax "Mírame a los ojos...")
  },
};

const CANCION_ACTIVA = CANCIONES[MODO_CANCION];
const VOLUMEN_INICIAL = 0.05;
const VOLUMEN_FINAL = 0.65;
const DURACION_FADE_MS = 3000;
const PASO_FADE_MS = 100;
const DURACION_TRANSICION_MS = 1500; // fase "transicionando"
const DURACION_FADE_OVERLAY_MS = 1000; // el overlay negro se desvanece al abrir

/* ---------------------------------------------------------------------
 *  🎬 MODO CINE AUTOMÁTICO + SCROLL MANUAL LIBRE
 *  - Ella solo necesita tocar "Abrir nuestra historia": la carta se abre
 *    sola, revela cada párrafo con calma y desliza suavemente por las
 *    fotos hasta llegar a la gran pregunta final.
 *  - Si en cualquier momento ella desliza con el dedo, el modo automático
 *    se pausa al instante para darle control manual total sin cortar la música.
 * ------------------------------------------------------------------- */
const MODO_AUTOMATICO_INICIAL = true;
const TIEMPO_ABRIR_SOBRE_MS = 1800; // el sobre L & M se abre solo tras 1.8s
const TIEMPO_POR_PARRAFO_MS = 6800; // 6.8s de lectura pausada por cada párrafo
const TIEMPO_LECTURA_FIRMA_MS = 3800; // pausa tras la firma antes de bajar a los recuerdos
const VELOCIDAD_AUTOSCROLL_PX_SEG = 46; // velocidad suave del recorrido (~46px por segundo)
const PAUSA_EN_CADA_FOTO_MS = 3000; // se detiene 3s frente a cada Polaroid para contemplarla

/* ---------------------------------------------------------------------
 *  ✉️ TEXTOS PERSONALES
 * ------------------------------------------------------------------- */
// ESCRIBIR TEXTO AQUÍ: pantalla de bienvenida
const TEXTO_BIENVENIDA =
  "Hice este espacio para ti: una carta, nuestros recuerdos y una pregunta importante.";
const TEXTO_BOTON_BIENVENIDA = "Abrir nuestra historia";

// MI CARTA AQUÍ: saludo, párrafos (agrega o quita los que quieras), despedida y firma
const CARTA_SALUDO = "Mi Mary,";
const CARTA_PARRAFOS: string[] = [
  "Hoy no te escribo por costumbre ni por compromiso: te escribo porque hoy te elijo. Hoy, mañana y en todos los planes que me imagino.", // MI CARTA AQUÍ
  "Quiero reconocer lo que fue y lo que pudo haber sido mejor. Por eso te propongo un borrón y cuenta nueva: hacer las cosas bien desde la raíz, sin prisas y sin darnos por sentado.", // MI CARTA AQUÍ
  "Esto nace 100% de mí, de mi iniciativa y de mis ganas. Estás en todos mis planes, Mary, y quiero que lo sepas de la forma más clara posible.", // MI CARTA AQUÍ
];
const CARTA_DESPEDIDA = "Con todo mi cariño,";
const CARTA_FIRMA = "Lisandro"; // MI CARTA AQUÍ: pon tu nombre
const CARTA_SELLO = "L & M"; // iniciales en el sello de cera del sobre
// Frases exactas dentro de CARTA_PARRAFOS que se iluminan con trazo dorado al revelarse
const FRASES_SUBRAYADAS: string[] = [
  "hoy te elijo",
  "borrón y cuenta nueva",
  "nace 100% de mí",
  "Estás en todos mis planes",
];

// Galería: 4 recuerdos
interface Recuerdo {
  src: string;
  fecha: string;
  pie: string;
}
const RECUERDOS: Recuerdo[] = [
  {
    src: "/foto1.webp", // CAMBIAR FOTO AQUÍ
    fecha: "Junio 2023 · Al principio", // ESCRIBIR FECHA / MOMENTO AQUÍ
    pie: "Tu cabeza en mi hombro y esa sonrisa tímida. Desde entonces me sentía en casa contigo.", // ESCRIBIR PIE DE FOTO AQUÍ
  },
  {
    src: "/foto2.webp", // CAMBIAR FOTO AQUÍ
    fecha: "Julio 2023 · El mirador", // ESCRIBIR FECHA / MOMENTO AQUÍ
    pie: "Con todo el cielo y las montañas enfrente, yo solo te miraba a ti.", // ESCRIBIR PIE DE FOTO AQUÍ
  },
  {
    src: "/foto3.webp", // CAMBIAR FOTO AQUÍ
    fecha: "Diciembre 2023 · Una noche cualquiera", // ESCRIBIR FECHA / MOMENTO AQUÍ
    pie: "No hacía falta un plan: contigo hasta una noche cualquiera se volvía especial.", // ESCRIBIR PIE DE FOTO AQUÍ
  },
  {
    src: "/foto4.webp", // CAMBIAR FOTO AQUÍ
    fecha: "Junio 2024 · Tú y yo", // ESCRIBIR FECHA / MOMENTO AQUÍ
    pie: "Me encanta cómo te ríes y cómo me haces querer ser mejor.", // ESCRIBIR PIE DE FOTO AQUÍ
  },
];

/* ---------------------------------------------------------------------
 *  📸 ÁLBUM POR CAPÍTULOS
 *  Las imágenes están en /public/album/NN.webp (pantalla completa) y
 *  /public/album/thumbs/NN.webp (miniaturas). w/h = tamaño de la miniatura
 *  (evita saltos de diseño mientras cargan).
 *  Para cambiar una foto: reemplaza el archivo con el mismo nombre.
 *  `nota` (opcional): texto íntimo que se muestra al abrir esa foto.
 * ------------------------------------------------------------------- */
interface FotoAlbum {
  id: string;
  w: number;
  h: number;
  nota?: string; // ESCRIBIR NOTA AQUÍ (opcional)
}
interface Capitulo {
  titulo: string;
  fecha: string;
  /** Frase corta bajo el título del capítulo */
  frase: string;
  fotos: FotoAlbum[];
}
const ALBUM: Capitulo[] = [
  {
    titulo: "Los primeros días",
    fecha: "Junio 2023",
    frase: "Cuando todo era nuevo y yo ya no quería irme.", // ESCRIBIR TEXTO AQUÍ
    fotos: [{ id: "01", w: 360, h: 640 }, { id: "02", w: 360, h: 640 }, { id: "03", w: 360, h: 640 }, { id: "04", w: 360, h: 640 }, { id: "05", w: 360, h: 640 }, { id: "06", w: 360, h: 640 }],
  },
  {
    titulo: "Aventura en las montañas",
    fecha: "Julio 2023",
    frase: "Contigo hasta el fin del camino es mi parte favorita.", // ESCRIBIR TEXTO AQUÍ
    fotos: [{ id: "07", w: 360, h: 640 }, { id: "08", w: 360, h: 640 }, { id: "09", w: 360, h: 640 }, { id: "10", w: 360, h: 640 }, { id: "11", w: 360, h: 640 }, { id: "12", w: 360, h: 640 }, { id: "13", w: 360, h: 640 }, { id: "14", w: 360, h: 640 }, { id: "15", w: 360, h: 640 }, { id: "16", w: 360, h: 640 }, { id: "17", w: 360, h: 640 }, { id: "18", w: 360, h: 640 }],
  },
  {
    titulo: "Entre risas y cafés",
    fecha: "Septiembre – Noviembre 2023",
    frase: "Los días normales que contigo se sienten especiales.", // ESCRIBIR TEXTO AQUÍ
    fotos: [{ id: "19", w: 360, h: 640 }, { id: "20", w: 360, h: 640 }, { id: "21", w: 360, h: 640 }, { id: "22", w: 640, h: 360 }, { id: "23", w: 360, h: 640 }, { id: "24", w: 640, h: 360 }, { id: "25", w: 360, h: 640 }],
  },
  {
    titulo: "Luces de diciembre",
    fecha: "Diciembre 2023",
    frase: "Una noche, muchas luces y tú de lo más bonito.", // ESCRIBIR TEXTO AQUÍ
    fotos: [{ id: "26", w: 640, h: 360 }, { id: "27", w: 640, h: 360 }, { id: "28", w: 360, h: 640 }, { id: "29", w: 360, h: 640 }, { id: "30", w: 640, h: 360 }, { id: "31", w: 640, h: 360 }, { id: "32", w: 640, h: 360 }],
  },
  {
    titulo: "Seguimos sumando",
    fecha: "2024 – 2026",
    frase: "Y todavía quiero coleccionar muchos más.", // ESCRIBIR TEXTO AQUÍ
    fotos: [{ id: "33", w: 360, h: 640 }, { id: "34", w: 360, h: 640 }, { id: "35", w: 360, h: 640 }, { id: "36", w: 360, h: 640 }, { id: "37", w: 360, h: 640 }, { id: "38", w: 480, h: 640 }, { id: "39", w: 640, h: 296 }],
  },
];

// ESCRIBIR TEXTO AQUÍ: encabezado del álbum
const TEXTO_ALBUM_TITULO = "Nuestro álbum";
const TEXTO_ALBUM_SUBTITULO = "Todo lo que hemos vivido, en un solo lugar";
// ESCRIBIR TEXTO AQUÍ: botón que abre la sección separada del álbum
const TEXTO_ABRIR_ALBUM = "Explorar nuestro álbum de recuerdos";
const TEXTO_VOLVER_CARTA = "Volver a nuestra carta";

// ESCRIBIR TEXTO AQUÍ: clímax
const TEXTO_INTRO_PREGUNTA =
  "Quiero empezar este nuevo capítulo como debió ser desde el primer día: naciendo de mí, sin que me lo tengas que pedir...";
const TEXTO_PREGUNTA = "¿Quieres ser mi novia en esta nueva etapa?";
const TEXTO_BOTON_SI = "¡Sí, empecemos de cero! ❤️";
const TEXTO_BOTON_PENSAR = "Prefiero pensarlo...";
const FRASES_PENSAR: string[] = [
  "Tómate tu tiempo, no hay prisa",
  "Podemos hablarlo cuando tú quieras",
  "Lo importante es que te sientas cómoda",
];
// ESCRIBIR TEXTO AQUÍ: mensaje final tras decir que sí
const TEXTO_FINAL_TITULO = "Lo sabía 🥹";
const TEXTO_FINAL =
  "Prometo cuidarte, tener iniciativa cada día y darte siempre tu lugar. Ahora baja el teléfono y mírame a los ojos, que te quiero dar un abrazo.";

/* ---------------------------------------------------------------------
 *  🎬 TIPOS
 * ------------------------------------------------------------------- */
type Fase = "bloqueado" | "transicionando" | "abierto";
type Vista = "historia" | "album";

/* ---------------------------------------------------------------------
 *  🎨 ESTILOS Y ANIMACIONES (inyectados, sin tocar tailwind.config.js)
 * ------------------------------------------------------------------- */
const ESTILOS = `
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&display=swap');

html { scroll-behavior: smooth; background: #0d0609; }
.fuente-serif { font-family: 'Playfair Display', Georgia, serif; }
.fuente-manuscrita { font-family: 'Dancing Script', cursive; }

/* Paleta Terciopelo Burdeos & Oro Champán */
.fondo-terciopelo {
  background: radial-gradient(circle at 50% 0%, #1f0d16 0%, #0d0609 65%, #080305 100%);
}
.tarjeta-terciopelo {
  background: linear-gradient(165deg, rgba(31, 13, 22, 0.88) 0%, rgba(15, 7, 11, 0.94) 100%);
  border: 1px solid rgba(243, 213, 181, 0.18);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(243, 213, 181, 0.12);
}

/* Sello de cera L & M en relieve */
.sello-lacre {
  background: radial-gradient(circle at 32% 28%, #fb7185 0%, #e11d48 45%, #881337 90%);
  box-shadow:
    0 10px 28px rgba(225, 29, 72, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.35),
    inset 0 -4px 8px rgba(60, 5, 22, 0.8);
}

/* Subrayado dorado animado para las frases clave de la carta */
@keyframes trazo-dorado {
  from { background-size: 0% 2px; }
  to   { background-size: 100% 2px; }
}
.subrayado-dorado {
  color: #fde68a;
  font-weight: 500;
  background-image: linear-gradient(90deg, rgba(251, 191, 36, 0.85), rgba(244, 63, 94, 0.75));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 2px;
  padding-bottom: 2px;
  animation: trazo-dorado 1.1s ease-out both;
  animation-delay: 0.25s;
}

/* Revelado suave de cada párrafo (blur-in + slide) */
@keyframes revelar-parrafo {
  from { opacity: 0; filter: blur(6px); transform: translateY(12px); }
  to   { opacity: 1; filter: blur(0);   transform: translateY(0); }
}
.animar-parrafo { animation: revelar-parrafo 0.85s cubic-bezier(0.16, 1, 0.3, 1) both; }

/* Barra de progreso dorada para el modo automático */
@keyframes progreso-lectura {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.barra-lectura-auto {
  transform-origin: left;
  animation: progreso-lectura ${TIEMPO_POR_PARRAFO_MS}ms linear forwards;
}

/* Latido del corazón */
@keyframes latido {
  0%, 100% { transform: scale(1); }
  14%      { transform: scale(1.16); }
  28%      { transform: scale(1); }
  42%      { transform: scale(1.11); }
  70%      { transform: scale(1); }
}
.animar-latido { animation: latido 1.8s ease-in-out infinite; }

/* Barras del ecualizador */
@keyframes ecualizador {
  0%, 100% { transform: scaleY(0.25); }
  50%      { transform: scaleY(1); }
}
.barra-eq {
  width: 3px; height: 100%;
  border-radius: 2px;
  transform-origin: bottom;
  background: linear-gradient(to top, #f43f5e, #fbbf24);
  animation: ecualizador 1s ease-in-out infinite;
}
.eq-pausado .barra-eq { animation-play-state: paused; transform: scaleY(0.2); }

/* Partículas / destellos que suben lentamente */
@keyframes subir-destello {
  0%   { transform: translateY(0) scale(0.6); opacity: 0; }
  15%  { opacity: 0.9; }
  50%  { opacity: 0.35; }
  85%  { opacity: 0.8; }
  100% { transform: translateY(-110vh) scale(1.1); opacity: 0; }
}
.particula { animation: subir-destello linear infinite; will-change: transform, opacity; }

/* Brillo suave en la frase de la canción */
@keyframes brillo-texto {
  0%, 100% { text-shadow: 0 0 10px rgba(251, 191, 36, 0.35), 0 0 24px rgba(244, 63, 94, 0.25); }
  50%      { text-shadow: 0 0 18px rgba(251, 191, 36, 0.8),  0 0 42px rgba(244, 63, 94, 0.55); }
}
.brillo-texto { animation: brillo-texto 2.2s ease-in-out infinite; }

/* Brillo pulsante del botón principal */
@keyframes brillo-boton {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.55), 0 8px 24px rgba(244, 63, 94, 0.25); }
  50%      { box-shadow: 0 0 0 14px rgba(244, 63, 94, 0), 0 8px 34px rgba(244, 63, 94, 0.5); }
}
.brillo-boton { animation: brillo-boton 2.4s ease-in-out infinite; }

/* Entrada del modal final */
@keyframes entrada-modal {
  from { opacity: 0; transform: translateY(24px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.animar-modal { animation: entrada-modal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }

/* Cambio de texto del botón "pensarlo" */
@keyframes cambio-texto {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animar-cambio-texto { animation: cambio-texto 0.3s ease-out both; }

/* Respeta "reducir movimiento" del sistema */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .animar-latido, .particula, .brillo-texto, .brillo-boton, .barra-eq { animation: none !important; }
}
`;

/* ---------------------------------------------------------------------
 *  🧩 COMPONENTES AUXILIARES
 * ------------------------------------------------------------------- */

/** Revela su contenido (fade + slide-up) cuando entra en pantalla al hacer scroll. */
function Aparecer({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Resalta las frases clave dentro de un párrafo con el subrayado dorado animado. */
function renderizarConSubrayado(texto: string): ReactNode {
  const escapadas = FRASES_SUBRAYADAS.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (escapadas.length === 0) return texto;
  const regex = new RegExp(`(${escapadas.join("|")})`, "gi");
  const partes = texto.split(regex);
  return partes.map((parte, idx) =>
    FRASES_SUBRAYADAS.some((f) => f.toLowerCase() === parte.toLowerCase()) ? (
      <span key={idx} className="subrayado-dorado">
        {parte}
      </span>
    ) : (
      parte
    ),
  );
}

/**
 * Formato WOW para la Carta:
 * 1) Inicia como una tarjeta nocturna cerrada con el sello L & M.
 * 2) En Modo Automático se abre sola tras 1.8s (o al instante si ella la toca)
 *    y revela cada párrafo suavemente cada 6.8s con subrayado dorado.
 * 3) Si ella decide hacer scroll manual hacia abajo, revela toda la carta
 *    automáticamente para que nunca se pierda ningún párrafo.
 */
function CartaInteractiva({
  abierto,
  modoAuto,
  forzarCompleta,
  onCartaCompleta,
}: {
  abierto: boolean;
  modoAuto: boolean;
  forzarCompleta: boolean;
  onCartaCompleta: () => void;
}) {
  const [sobreAbierto, setSobreAbierto] = useState(false);
  const [parrafosVisibles, setParrafosVisibles] = useState(1);
  const reduceMotion = useReducedMotion();
  const total = CARTA_PARRAFOS.length;
  const completa = parrafosVisibles >= total;

  // Si el usuario desliza manualmente hacia abajo, mostramos toda la carta de inmediato
  useEffect(() => {
    if (forzarCompleta) {
      setSobreAbierto(true);
      setParrafosVisibles(total);
    }
  }, [forzarCompleta, total]);

  // 1) En modo automático, abre el sobre suavemente tras TIEMPO_ABRIR_SOBRE_MS
  useEffect(() => {
    if (!abierto || !modoAuto || sobreAbierto) return;
    const timer = window.setTimeout(() => {
      setSobreAbierto(true);
    }, TIEMPO_ABRIR_SOBRE_MS);
    return () => window.clearTimeout(timer);
  }, [abierto, modoAuto, sobreAbierto]);

  // 2) En modo automático, revela cada párrafo tras TIEMPO_POR_PARRAFO_MS
  useEffect(() => {
    if (!abierto || !sobreAbierto || !modoAuto || completa) return;
    const timer = window.setTimeout(() => {
      setParrafosVisibles((n) => Math.min(total, n + 1));
    }, TIEMPO_POR_PARRAFO_MS);
    return () => window.clearTimeout(timer);
  }, [abierto, sobreAbierto, modoAuto, completa, parrafosVisibles, total]);

  // 3) Notifica cuando se han revelado todos los párrafos y la firma
  useEffect(() => {
    if (sobreAbierto && completa) {
      onCartaCompleta();
    }
  }, [sobreAbierto, completa, onCartaCompleta]);

  const abrirSobre = () => {
    setSobreAbierto(true);
    navigator.vibrate?.(25);
  };

  const siguienteParrafo = () => {
    setParrafosVisibles((n) => Math.min(total, n + 1));
    navigator.vibrate?.(15);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!sobreAbierto ? (
        <motion.div
          key="invitacion"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02, filter: "blur(4px)" }}
          transition={{ duration: reduceMotion ? 0.2 : 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="tarjeta-terciopelo relative overflow-hidden rounded-3xl p-6 text-center sm:p-8"
        >
        {/* Brillo decorativo de la tarjeta */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-rose-400/10 blur-3xl"
        />

        <p className="text-[0.7rem] font-medium tracking-[0.25em] text-amber-200/80 uppercase">
          Una carta, sin prisa
        </p>
        <h2 className="fuente-manuscrita mt-2 text-4xl text-amber-200">{CARTA_SALUDO}</h2>
        <p className="fuente-serif mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-300/90 italic">
          Antes de ver nuestros recuerdos, quiero decirte algo desde el corazón.
        </p>

        {/* Invitación interactiva para abrir la carta */}
        <div className="my-8 flex flex-col items-center">
          <button
            type="button"
            onClick={abrirSobre}
            aria-label="Abrir la carta"
            className="abrir-carta group relative flex min-h-16 items-center gap-3 rounded-full border border-amber-200/35 bg-gradient-to-r from-rose-500/20 to-amber-300/10 px-7 text-sm font-medium text-amber-100 shadow-lg shadow-black/30 transition duration-300 hover:border-amber-200/70 hover:bg-rose-500/30 active:scale-95"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200/40 bg-amber-200/10 text-xs font-semibold tracking-wider text-amber-200">
              {CARTA_SELLO}
            </span>
            <span>Leer mi carta</span>
            <span aria-hidden className="text-lg text-amber-300 transition-transform group-hover:translate-x-1">→</span>
          </button>
          <span className="mt-3 text-xs text-stone-400">
            {modoAuto ? "Abriendo automáticamente..." : "Toca cuando estés lista"}
          </span>
        </div>
        </motion.div>
      ) : (
        <motion.article
          key="carta"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="tarjeta-terciopelo relative rounded-3xl p-6 backdrop-blur-md sm:p-7"
        >
      <div className="mb-4 flex items-center justify-between">
        <Heart className="h-5 w-5 text-rose-500" fill="currentColor" strokeWidth={0} aria-hidden />
        <span className="text-[0.68rem] tracking-[0.22em] text-amber-200/60 uppercase">
          {parrafosVisibles} / {total}
        </span>
      </div>

      <h2 className="fuente-manuscrita mb-5 text-4xl text-amber-200">{CARTA_SALUDO}</h2>

      {/* Párrafos que se van revelando uno por uno con frases clave subrayadas en dorado */}
      <div className="fuente-serif space-y-5 text-[1.06rem] leading-relaxed text-stone-100">
        {CARTA_PARRAFOS.slice(0, parrafosVisibles).map((parrafo, i) => (
          <p key={i} className="animar-parrafo">
            {renderizarConSubrayado(parrafo)}
          </p>
        ))}
      </div>

      {!completa ? (
        <div className="mt-8 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={siguienteParrafo}
            className="relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-full border border-amber-200/30 bg-rose-950/50 px-6 py-2.5 text-sm font-medium text-amber-200 shadow-lg shadow-black/40 transition active:scale-95 active:bg-rose-900/60"
          >
            {modoAuto && (
              <span
                key={parrafosVisibles}
                aria-hidden
                className="barra-lectura-auto pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400"
              />
            )}
            <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
            <span>{modoAuto ? "Leyendo contigo... (toca para adelantar)" : "Toca para seguir leyendo..."}</span>
          </button>
        </div>
      ) : (
        <div className="animar-parrafo mt-8 border-t border-amber-200/10 pt-5 text-right">
          <p className="fuente-serif text-sm text-stone-400 italic">{CARTA_DESPEDIDA}</p>
          <p className="fuente-manuscrita mt-1 text-4xl text-rose-400">{CARTA_FIRMA}</p>
          {modoAuto && (
            <p className="mt-4 text-center text-[0.7rem] tracking-widest text-amber-200/60 uppercase">
              ✨ Deslizando suave hacia nuestros recuerdos · Puedes mover con tu dedo cuando quieras
            </p>
          )}
        </div>
      )}
        </motion.article>
      )}
    </AnimatePresence>
  );
}

/** Tarjeta polaroid nocturna: marco oscuro, rotación alternada, fecha y pie de foto. */
function Polaroid({ recuerdo, indice }: { recuerdo: Recuerdo; indice: number }) {
  const [error, setError] = useState(false);
  // Rotación alternada: -rotate-1 / rotate-2
  const rotacion = indice % 2 === 0 ? "-rotate-1" : "rotate-2";

  return (
    <Aparecer delay={100}>
      <figure
        data-parada-foto={indice}
        className={`tarjeta-terciopelo mx-auto w-full max-w-xs ${rotacion} rounded-lg p-3 pb-5 shadow-2xl shadow-black/60`}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-slate-800 ring-1 ring-white/5">
          {error ? (
            // Placeholder mientras no tengas la foto en /public
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-rose-950 p-4 text-center text-rose-300/80">
              <Heart className="h-8 w-8" aria-hidden />
              <span className="text-sm font-medium">CAMBIAR FOTO AQUÍ</span>
              <code className="text-xs opacity-70">{recuerdo.src}</code>
            </div>
          ) : (
            <img
              src={recuerdo.src}
              alt={recuerdo.pie}
              loading="lazy"
              onError={() => setError(true)}
              className="h-full w-full object-cover"
            />
          )}
          {/* Viñeta nocturna */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        <figcaption className="mt-4 px-1 text-center">
          <span className="mb-1 block text-[0.68rem] font-medium tracking-[0.2em] text-amber-400/90 uppercase">
            {recuerdo.fecha}
          </span>
          <span className="fuente-manuscrita text-[1.55rem] leading-snug text-slate-200">{recuerdo.pie}</span>
        </figcaption>
      </figure>
    </Aparecer>
  );
}

/** Lista plana de todas las fotos del álbum (para navegar en el visor) y dónde empieza cada capítulo. */
interface FotoPlana extends FotoAlbum {
  capitulo: string;
  fecha: string;
}
const FOTOS_PLANAS: FotoPlana[] = ALBUM.flatMap((cap) =>
  cap.fotos.map((f) => ({ ...f, capitulo: cap.titulo, fecha: cap.fecha })),
);
const INICIO_CAPITULO: number[] = ALBUM.map((_, i) =>
  ALBUM.slice(0, i).reduce((suma, c) => suma + c.fotos.length, 0),
);

/** Miniatura del álbum: aparece con fade cuando termina de cargar. */
function Miniatura({ foto, onAbrir }: { foto: FotoAlbum; onAbrir: () => void }) {
  const [cargada, setCargada] = useState(false);
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label="Ver foto en grande"
      className="block w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-rose-950/60 shadow-lg shadow-black/40 ring-1 ring-white/10 transition active:scale-[0.97]"
      style={{ aspectRatio: `${foto.w} / ${foto.h}` }}
    >
      <img
        src={`/album/thumbs/${foto.id}.webp`}
        width={foto.w}
        height={foto.h}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setCargada(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ${cargada ? "opacity-100" : "opacity-0"}`}
      />
    </button>
  );
}

/** Álbum en su propia sección independiente: capítulos con collage y botón para volver a la carta. */
function Album({ onAbrir, onVolver }: { onAbrir: (indice: number) => void; onVolver: () => void }) {
  return (
    <section className="animar-cambio-texto py-6">
      <div className="mb-8 flex justify-start">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 backdrop-blur-sm transition active:scale-95 active:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 text-amber-400" aria-hidden />
          {TEXTO_VOLVER_CARTA}
        </button>
      </div>

      <Aparecer className="mb-12 text-center">
        <Camera className="mx-auto mb-3 h-5 w-5 text-amber-400" aria-hidden />
        <h2 className="fuente-serif text-3xl text-slate-100">{TEXTO_ALBUM_TITULO}</h2>
        <p className="fuente-manuscrita mt-1 text-2xl text-amber-400/90">{TEXTO_ALBUM_SUBTITULO}</p>
        <p className="mt-3 text-xs tracking-[0.2em] text-slate-500 uppercase">{FOTOS_PLANAS.length} momentos</p>
      </Aparecer>

      <div className="space-y-16">
        {ALBUM.map((cap, c) => (
          <div key={cap.titulo}>
            <Aparecer className="mb-6 text-center">
              <span className="text-[0.7rem] font-medium tracking-[0.2em] text-amber-400/90 uppercase">{cap.fecha}</span>
              <h3 className="fuente-serif mt-1 text-2xl text-slate-100">{cap.titulo}</h3>
              <p className="fuente-manuscrita mt-1 text-xl text-rose-300/90">{cap.frase}</p>
            </Aparecer>

            <div className="columns-2 gap-3">
              {cap.fotos.map((foto, i) => (
                <Aparecer key={foto.id} delay={(i % 2) * 120} className="mb-3 break-inside-avoid">
                  <Miniatura foto={foto} onAbrir={() => onAbrir(INICIO_CAPITULO[c] + i)} />
                </Aparecer>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-slate-900/70 px-6 py-3 text-sm text-slate-200 transition active:scale-95 active:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 text-amber-400" aria-hidden />
          {TEXTO_VOLVER_CARTA}
        </button>
      </div>
    </section>
  );
}

/** Imagen grande del visor: usa la miniatura (ya cargada) como fondo borroso mientras llega la grande. */
function ImagenVisor({ foto }: { foto: FotoPlana }) {
  const [cargada, setCargada] = useState(false);
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <img
        src={`/album/thumbs/${foto.id}.webp`}
        alt=""
        aria-hidden
        className="absolute max-h-full max-w-full rounded-lg object-contain blur-sm"
      />
      <img
        src={`/album/${foto.id}.webp`}
        alt={foto.nota ?? `${foto.capitulo}, ${foto.fecha}`}
        onLoad={() => setCargada(true)}
        draggable={false}
        className={`relative max-h-full max-w-full rounded-lg object-contain shadow-2xl shadow-black/60 transition-opacity duration-500 ${
          cargada ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

/** Visor a pantalla completa: swipe, flechas del teclado, botones y precarga de vecinas. */
function Visor({
  indice,
  onCambiar,
  onCerrar,
}: {
  indice: number;
  onCambiar: (indice: number) => void;
  onCerrar: () => void;
}) {
  const inicioX = useRef<number | null>(null);
  const total = FOTOS_PLANAS.length;
  const foto = FOTOS_PLANAS[indice];

  const anterior = () => onCambiar((indice - 1 + total) % total);
  const siguiente = () => onCambiar((indice + 1) % total);

  // Teclado: ← → Esc
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      else if (e.key === "ArrowLeft") onCambiar((indice - 1 + total) % total);
      else if (e.key === "ArrowRight") onCambiar((indice + 1) % total);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [indice, total, onCambiar, onCerrar]);

  // Precarga la foto anterior y la siguiente para que el swipe sea instantáneo
  useEffect(() => {
    [(indice + 1) % total, (indice - 1 + total) % total].forEach((i) => {
      const img = new Image();
      img.src = `/album/${FOTOS_PLANAS[i].id}.webp`;
    });
  }, [indice, total]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotos"
      className="animar-cambio-texto fixed inset-0 z-[70] flex flex-col bg-slate-950/95 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      onTouchStart={(e) => {
        inicioX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (inicioX.current === null) return;
        const delta = e.changedTouches[0].clientX - inicioX.current;
        inicioX.current = null;
        if (Math.abs(delta) > 50) (delta < 0 ? siguiente : anterior)();
      }}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-slate-400 tabular-nums">
          {indice + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar visor"
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-200 active:bg-white/10"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Imagen + flechas */}
      <div className="relative min-h-0 flex-1 px-3">
        <ImagenVisor key={foto.id} foto={foto} />
        <button
          type="button"
          onClick={anterior}
          aria-label="Foto anterior"
          className="absolute top-1/2 left-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/60 text-slate-100 backdrop-blur-sm active:scale-90"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={siguiente}
          aria-label="Foto siguiente"
          className="absolute top-1/2 right-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/60 text-slate-100 backdrop-blur-sm active:scale-90"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Pie: capítulo, fecha y nota */}
      <div className="px-6 py-4 text-center">
        <p className="text-[0.7rem] tracking-[0.2em] text-amber-400/90 uppercase">{foto.fecha}</p>
        <p className="fuente-serif text-lg text-slate-100">{foto.capitulo}</p>
        {foto.nota && <p className="fuente-manuscrita mt-1 text-xl text-rose-300">{foto.nota}</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
 *  🏠 COMPONENTE PRINCIPAL
 * ------------------------------------------------------------------- */
export default function App() {
  const [fase, setFase] = useState<Fase>("bloqueado");
  const [overlayMontado, setOverlayMontado] = useState(true);
  const [indicePensar, setIndicePensar] = useState(-1); // -1 = texto original
  const [aceptado, setAceptado] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [visor, setVisor] = useState<number | null>(null); // índice de la foto abierta en el visor
  const [vista, setVista] = useState<Vista>("historia"); // sección activa: historia principal o álbum separado
  const [silenciado, setSilenciado] = useState(false);
  const [modoAuto, setModoAuto] = useState(MODO_AUTOMATICO_INICIAL);
  const [cartaCompleta, setCartaCompleta] = useState(false);
  const [forzarCartaCompleta, setForzarCartaCompleta] = useState(false);
  const [recorridoTerminado, setRecorridoTerminado] = useState(false);
  const paradasFotosRef = useRef<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const timeoutsRef = useRef<number[]>([]);

  // Partículas del fondo (posiciones aleatorias fijadas una sola vez)
  const particulas = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duracion: 9 + Math.random() * 12,
        retraso: -Math.random() * 20,
        calida: i % 3 === 0,
      })),
    [],
  );

  /** Inicia el audio de fondo con un fade-in suave */
  const iniciarAudioConFadeIn = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current !== null) window.clearInterval(fadeRef.current);
    audio.volume = VOLUMEN_INICIAL;
    audio.muted = false;

    const posicionar = () => {
      if (CANCION_ACTIVA.segundoInicio > 0) {
        audio.currentTime = CANCION_ACTIVA.segundoInicio;
      }
    };
    if (audio.readyState >= 1) posicionar();
    else audio.addEventListener("loadedmetadata", posicionar, { once: true });

    audio.play().catch(() => undefined);

    const pasos = DURACION_FADE_MS / PASO_FADE_MS;
    const incremento = (VOLUMEN_FINAL - VOLUMEN_INICIAL) / pasos;
    let paso = 0;
    fadeRef.current = window.setInterval(() => {
      paso += 1;
      if (audio) {
        audio.volume = Math.min(VOLUMEN_FINAL, VOLUMEN_INICIAL + incremento * paso);
      }
      if (paso >= pasos && fadeRef.current !== null) {
        window.clearInterval(fadeRef.current);
        fadeRef.current = null;
      }
    }, PASO_FADE_MS);
  };

  // Mantiene el bucle en el segundoInicio si está configurado
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || CANCION_ACTIVA.segundoInicio <= 0) return;
    let ultimo = 0;
    const alActualizar = () => {
      if (audio.currentTime + 1 < ultimo) audio.currentTime = CANCION_ACTIVA.segundoInicio;
      ultimo = audio.currentTime;
    };
    audio.addEventListener("timeupdate", alActualizar);
    return () => audio.removeEventListener("timeupdate", alActualizar);
  }, []);

  const alternarSonido = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nuevo = !silenciado;
    audio.muted = nuevo;
    setSilenciado(nuevo);
    if (!nuevo && audio.paused) audio.play().catch(() => undefined);
  };

  /** Bloquea el scroll mientras no esté abierta la carta o mientras el visor está abierto. */
  useEffect(() => {
    document.body.style.overflow = fase === "abierto" && visor === null ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fase, visor]);

  /** Si el navegador bloqueó el autoplay al inicio, el siguiente toque de ella activa el audio de fondo */
  useEffect(() => {
    const reanudarAlTocar = () => {
      const audio = audioRef.current;
      if (fase === "abierto" && audio && audio.paused && !silenciado) {
        audio.play().catch(() => undefined);
      }
    };
    window.addEventListener("touchstart", reanudarAlTocar, { passive: true });
    window.addEventListener("click", reanudarAlTocar);
    return () => {
      window.removeEventListener("touchstart", reanudarAlTocar);
      window.removeEventListener("click", reanudarAlTocar);
    };
  }, [fase, silenciado]);

  /**
   * Detección inteligente de scroll manual:
   * Si ella desliza con el dedo (touchmove > 10px) o usa la rueda del mouse,
   * pausamos el modo automático al instante para cederle 100% el control manual
   * sin pelear contra su dedo, y revelamos toda la carta por si bajó antes.
   */
  useEffect(() => {
    if (fase !== "abierto" || vista !== "historia") return;
    let touchInicioY: number | null = null;

    const cederControlManual = () => {
      setModoAuto(false);
      setForzarCartaCompleta(true);
    };

    const alTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchInicioY = e.touches[0].clientY;
      }
    };

    const alTouchMove = (e: TouchEvent) => {
      if (touchInicioY === null || e.touches.length !== 1) return;
      const dy = Math.abs(e.touches[0].clientY - touchInicioY);
      if (dy > 10) {
        cederControlManual();
      }
    };

    const alWheel = () => cederControlManual();

    const alKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(e.key)) {
        cederControlManual();
      }
    };

    window.addEventListener("touchstart", alTouchStart, { passive: true });
    window.addEventListener("touchmove", alTouchMove, { passive: true });
    window.addEventListener("wheel", alWheel, { passive: true });
    window.addEventListener("keydown", alKeyDown);

    return () => {
      window.removeEventListener("touchstart", alTouchStart);
      window.removeEventListener("touchmove", alTouchMove);
      window.removeEventListener("wheel", alWheel);
      window.removeEventListener("keydown", alKeyDown);
    };
  }, [fase, vista]);

  /**
   * Motor de Auto-Scroll Cinematográfico:
   * Cuando la carta termina de revelarse y modoAuto sigue activo, espera
   * TIEMPO_LECTURA_FIRMA_MS y desliza suavemente hacia abajo, haciendo una
   * pausa de 3s frente a cada Polaroid hasta llegar al Clímax y la Gran Pregunta.
   */
  useEffect(() => {
    if (
      fase !== "abierto" ||
      vista !== "historia" ||
      !modoAuto ||
      !cartaCompleta ||
      recorridoTerminado ||
      visor !== null ||
      modalAbierto ||
      reduceMotion
    ) {
      return;
    }

    let rafId: number | null = null;
    let ultimoTiempo: number | null = null;
    let pausadoHasta = performance.now() + TIEMPO_LECTURA_FIRMA_MS;
    let scrollAcumulado = window.scrollY;

    const pasoScroll = (ahora: number) => {
      if (ultimoTiempo === null) ultimoTiempo = ahora;
      const dt = Math.min(64, ahora - ultimoTiempo);
      ultimoTiempo = ahora;

      if (ahora < pausadoHasta) {
        scrollAcumulado = window.scrollY;
        rafId = requestAnimationFrame(pasoScroll);
        return;
      }

      // Comprobar si llegamos al centro de la sección del Clímax o al final de la página
      const seccionClimax = document.querySelector<HTMLElement>("[data-parada-climax]");
      const centroPantalla = window.innerHeight * 0.48;
      if (seccionClimax) {
        const rectClimax = seccionClimax.getBoundingClientRect();
        const centroClimax = rectClimax.top + rectClimax.height / 2;
        if (centroClimax <= centroPantalla + 12) {
          setRecorridoTerminado(true);
          setModoAuto(false);
          return;
        }
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6) {
        setRecorridoTerminado(true);
        setModoAuto(false);
        return;
      }

      // Comprobar si alguna Polaroid acaba de centrarse en pantalla para pausar 3s y admirarla
      const fotos = document.querySelectorAll<HTMLElement>("[data-parada-foto]");
      for (const el of fotos) {
        const idx = Number(el.dataset.paradaFoto);
        if (!paradasFotosRef.current.has(idx)) {
          const rect = el.getBoundingClientRect();
          const centroFoto = rect.top + rect.height / 2;
          if (Math.abs(centroFoto - centroPantalla) <= 18) {
            paradasFotosRef.current.add(idx);
            pausadoHasta = ahora + PAUSA_EN_CADA_FOTO_MS;
            rafId = requestAnimationFrame(pasoScroll);
            return;
          }
        }
      }

      // Avance suave en coma flotante (fluido en pantallas de 60Hz y 120Hz)
      scrollAcumulado += (VELOCIDAD_AUTOSCROLL_PX_SEG * dt) / 1000;
      window.scrollTo({ top: scrollAcumulado, behavior: "instant" });

      rafId = requestAnimationFrame(pasoScroll);
    };

    rafId = requestAnimationFrame(pasoScroll);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [fase, vista, modoAuto, cartaCompleta, recorridoTerminado, visor, modalAbierto, reduceMotion]);

  const alternarModoAuto = () => {
    setModoAuto((actual) => {
      const nuevo = !actual;
      if (nuevo) {
        setRecorridoTerminado(false);
        setForzarCartaCompleta(true);
        setCartaCompleta(true);
      }
      return nuevo;
    });
  };

  /** Limpieza al desmontar: timeouts y fade pendientes. */
  useEffect(() => {
    const timeouts = timeoutsRef;
    return () => {
      if (fadeRef.current !== null) window.clearInterval(fadeRef.current);
      timeouts.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  /** Fase 1 → 2 → 3 */
  const abrirCarta = () => {
    if (fase !== "bloqueado") return;
    setFase("transicionando");
    iniciarAudioConFadeIn();

    timeoutsRef.current.push(
      window.setTimeout(() => {
        setFase("abierto");
        window.scrollTo({ top: 0 });
        // Desmonta el overlay cuando termina de desvanecerse
        timeoutsRef.current.push(
          window.setTimeout(() => setOverlayMontado(false), DURACION_FADE_OVERLAY_MS),
        );
      }, DURACION_TRANSICION_MS),
    );
  };

  const dispararConfeti = () => {
    const base = {
      zIndex: 200,
      colors: ["#f43f5e", "#fb7185", "#fbbf24", "#fde68a", "#ffffff"], // rosa, dorado, blanco
      disableForReducedMotion: true,
    };
    confetti({ ...base, particleCount: 150, spread: 100, startVelocity: 45, origin: { y: 0.65 } });
    const fin = Date.now() + 3000;
    (function lluvia() {
      confetti({ ...base, particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } });
      confetti({ ...base, particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } });
      confetti({ ...base, particleCount: 2, spread: 90, startVelocity: 20, gravity: 0.6, origin: { x: Math.random(), y: 0 } });
      if (Date.now() < fin) requestAnimationFrame(lluvia);
    })();
  };

  const aceptar = () => {
    setAceptado(true);
    setModalAbierto(true);
    dispararConfeti();
  };

  const pensarlo = () => {
    // Cicla por las frases y vuelve al texto original al terminar
    setIndicePensar((i) => (i + 1 >= FRASES_PENSAR.length ? -1 : i + 1));
    navigator.vibrate?.(30);
  };

  // Cerrar modal con Escape
  useEffect(() => {
    if (!modalAbierto) return;
    const alPulsar = (e: KeyboardEvent) => e.key === "Escape" && setModalAbierto(false);
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [modalAbierto]);

  /** Cambia entre la carta principal y la sección independiente del álbum. */
  const cambiarVista = (nuevaVista: Vista) => {
    setModalAbierto(false);
    setVista(nuevaVista);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const textoPensar = indicePensar === -1 ? TEXTO_BOTON_PENSAR : FRASES_PENSAR[indicePensar];
  const abierto = fase === "abierto";

  return (
    <div className="fondo-terciopelo relative min-h-dvh overflow-x-hidden font-sans text-stone-100 antialiased">
      <style>{ESTILOS}</style>

      {/* Motor de audio ambiental de fondo */}
      <audio ref={audioRef} src={CANCION_ACTIVA.src} loop preload="auto" />

      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Luces difuminadas de fondo (Terciopelo Burdeos & Oro Champán) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-rose-600/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-rose-500/15 blur-3xl" />
      </div>

      {/* =============== FASE 3: BARRA SUPERIOR DISCRETA =============== */}
      <header
        aria-hidden={!abierto}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        className={`fixed inset-x-0 top-0 z-40 border-b border-amber-200/15 bg-[#14080d]/85 backdrop-blur-md transition-all duration-1000 ease-out ${
          abierto ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Indicador de música ambiental de fondo (con silenciador) */}
          <button
            type="button"
            onClick={alternarSonido}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/20 bg-rose-950/40 px-2.5 py-1.5 text-xs text-amber-200/90 shadow-sm transition active:scale-95"
            aria-label={silenciado ? "Activar música" : "Silenciar música"}
          >
            <div className={`flex h-3 items-end gap-[2px] ${silenciado ? "opacity-30" : ""}`}>
              <span className="h-2 w-[2px] animate-pulse rounded-full bg-rose-400" />
              <span className="h-3 w-[2px] animate-pulse rounded-full bg-amber-300" style={{ animationDelay: "200ms" }} />
              <span className="h-1.5 w-[2px] animate-pulse rounded-full bg-rose-400" style={{ animationDelay: "400ms" }} />
            </div>
            <span>{silenciado ? "Pausada" : "Música"}</span>
            {silenciado ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-amber-300" />}
          </button>

          {/* Indicador / Selector de Modo Cine Automático vs Scroll Manual */}
          {vista === "historia" && !recorridoTerminado && (
            <button
              type="button"
              onClick={alternarModoAuto}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition active:scale-95 ${
                modoAuto
                  ? "border-amber-300/40 bg-amber-400/15 text-amber-200"
                  : "border-white/15 bg-slate-900/50 text-stone-300"
              }`}
              title={modoAuto ? "Recorrido automático activo (toca o desliza para modo manual)" : "Modo manual activo (toca para activar recorrido automático)"}
            >
              <Sparkles className={`h-3 w-3 ${modoAuto ? "animate-spin text-amber-300" : "text-stone-400"}`} style={{ animationDuration: "5s" }} aria-hidden />
              <span>{modoAuto ? "Modo Cine" : "Manual"}</span>
            </button>
          )}

          {/* Botón de acceso al Álbum o volver a la Carta */}
          <button
            type="button"
            onClick={() => cambiarVista(vista === "historia" ? "album" : "historia")}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition active:scale-95 active:bg-amber-400/20"
          >
            {vista === "historia" ? (
              <>
                <Camera className="h-3.5 w-3.5" aria-hidden />
                Álbum ({FOTOS_PLANAS.length})
              </>
            ) : (
              <>
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Volver a la carta
              </>
            )}
          </button>
        </div>
      </header>

      {/* =============== CONTENIDO PRINCIPAL (emerge en la fase 3) =============== */}
      <main
        aria-hidden={!abierto}
        className={`relative z-10 mx-auto max-w-md px-4 pt-16 pb-12 transition-all duration-1000 ease-out sm:px-5 sm:pt-20 sm:pb-16 ${
          abierto ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
        }`}
      >
        {vista === "historia" ? (
          <>
            {/* ---------- SECCIÓN A: LA CARTA DE SINCERIDAD (SOBRE LACRE + REVELADO PAUSADO) ---------- */}
            <section className="flex min-h-[78dvh] flex-col justify-center py-8 sm:min-h-[85dvh] sm:py-10">
              <Aparecer>
                <CartaInteractiva
                  abierto={abierto}
                  modoAuto={modoAuto}
                  forzarCompleta={forzarCartaCompleta}
                  onCartaCompleta={() => setCartaCompleta(true)}
                />
              </Aparecer>
            </section>

            {/* ---------- SECCIÓN B: GALERÍA DE RECUERDOS ---------- */}
            <section className="py-14">
              <Aparecer className="mb-12 text-center">
                <Sparkles className="mx-auto mb-3 h-5 w-5 text-amber-400" aria-hidden />
                <h2 className="fuente-serif text-3xl text-slate-100">Nuestros recuerdos</h2>
                <p className="fuente-manuscrita mt-1 text-2xl text-amber-400/90">Lo que guardo de ti</p>
              </Aparecer>

              <div className="space-y-14">
                {RECUERDOS.map((recuerdo, i) => (
                  <Polaroid key={recuerdo.src} recuerdo={recuerdo} indice={i} />
                ))}
              </div>
            </section>

            {/* ---------- SECCIÓN C: EL CLÍMAX Y LA GRAN PREGUNTA ---------- */}
            <section
              data-parada-climax
              className="flex min-h-[88dvh] flex-col items-center justify-center py-16 text-center sm:min-h-dvh sm:py-20"
            >
              {/* Cita que acompaña el momento */}
              <Aparecer>
                <blockquote className="relative rounded-2xl border border-amber-400/20 bg-gradient-to-b from-slate-900/70 to-rose-950/40 px-6 py-8 shadow-xl shadow-rose-950/30">
                  <Quote className="mx-auto mb-3 h-6 w-6 text-amber-400/80" aria-hidden />
                  <p className="fuente-serif brillo-texto text-xl leading-relaxed text-amber-100 italic">
                    “{CANCION_ACTIVA.cita}”
                  </p>
                  <footer className="mt-4 text-xs tracking-[0.2em] text-slate-400 uppercase">— {CANCION_ACTIVA.autor}</footer>
                </blockquote>
              </Aparecer>

              <Aparecer delay={150} className="mt-12">
                <Heart
                  className="animar-latido mx-auto mb-5 h-10 w-10 text-rose-500 drop-shadow-[0_0_14px_rgba(244,63,94,0.7)]"
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden
                />
                <p className="fuente-serif text-lg leading-relaxed text-slate-300 italic">{TEXTO_INTRO_PREGUNTA}</p>
                <motion.h2
                  className="fuente-serif mt-8 text-3xl leading-snug font-bold text-amber-300"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
                  whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.65 }}
                  transition={reduceMotion ? { duration: 0.2 } : { type: "spring", stiffness: 120, damping: 18 }}
                >
                  <em>{TEXTO_PREGUNTA}</em>
                </motion.h2>
              </Aparecer>

              <Aparecer delay={250} className="mt-12 flex w-full flex-col items-center gap-4">
                {/* Botón principal */}
                <button
                  type="button"
                  onClick={aceptar}
                  className="brillo-boton min-h-14 w-full rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 text-lg font-semibold text-white transition active:scale-95"
                >
                  {TEXTO_BOTON_SI}
                </button>

                {/* Botón secundario juguetón */}
                {!aceptado && (
                  <button
                    type="button"
                    onClick={pensarlo}
                    className="min-h-12 w-full rounded-full border border-white/15 bg-slate-900/60 px-6 py-3 text-base text-slate-300 transition active:scale-95 active:bg-slate-800"
                  >
                    <span key={textoPensar} className="animar-cambio-texto inline-block">
                      {textoPensar}
                    </span>
                  </button>
                )}
              </Aparecer>

              {/* Acceso a la sección separada del álbum (no alarga la página principal) */}
              <Aparecer delay={350} className="mt-14">
                <button
                  type="button"
                  onClick={() => cambiarVista("album")}
                  className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-amber-400/30 bg-slate-900/70 px-6 py-3 text-sm text-amber-300 backdrop-blur-sm transition active:scale-95 active:bg-slate-800"
                >
                  <Camera className="h-4 w-4" aria-hidden />
                  {TEXTO_ABRIR_ALBUM} ({FOTOS_PLANAS.length} fotos)
                </button>
              </Aparecer>
            </section>
          </>
        ) : (
          /* ---------- SECCIÓN SEPARADA: ÁLBUM COMPLETO ---------- */
          <Album onAbrir={setVisor} onVolver={() => cambiarVista("historia")} />
        )}

        <footer className="pt-6 text-center text-xs text-slate-600">
          {/* ESCRIBIR TEXTO AQUÍ (opcional): frase de cierre */}
          Hecho con ❤️ solo para ti
        </footer>
      </main>

      {/* =============== FASES 1 y 2: OVERLAY DE BIENVENIDA / TRANSICIÓN =============== */}
      {overlayMontado && (
        <div
          style={{ transitionDuration: `${DURACION_FADE_OVERLAY_MS}ms` }}
          className={`fondo-terciopelo fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-8 text-center transition-opacity ease-in-out ${
            abierto ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {/* Partículas y destellos sutiles */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {particulas.map((p) => (
              <span
                key={p.id}
                className={`particula absolute rounded-full ${p.calida ? "bg-amber-300" : "bg-rose-400"}`}
                style={{
                  left: `${p.left}%`,
                  bottom: "-10px",
                  width: p.size,
                  height: p.size,
                  animationDuration: `${p.duracion}s`,
                  animationDelay: `${p.retraso}s`,
                  filter: "blur(0.5px)",
                  boxShadow: `0 0 ${p.size * 3}px currentColor`,
                }}
              />
            ))}
          </div>
          <div aria-hidden className="absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl" />

          {/* Fase 1: contenido de bienvenida (se desvanece en la fase 2) */}
          <div
            className={`relative flex flex-col items-center transition-all duration-1000 ease-in-out ${
              fase === "bloqueado" ? "scale-100 opacity-100 blur-0" : "pointer-events-none scale-95 opacity-0 blur-sm"
            }`}
          >
            <Heart
              className="animar-latido mb-8 h-16 w-16 text-rose-500 drop-shadow-[0_0_18px_rgba(244,63,94,0.85)]"
              fill="currentColor"
              strokeWidth={0}
              aria-hidden
            />
            <p className="mb-3 text-[0.68rem] font-medium tracking-[0.28em] text-amber-200/80 uppercase">
              Una carta para nuestra nueva etapa
            </p>
            <p className="fuente-serif max-w-sm text-xl leading-relaxed text-slate-200">{TEXTO_BIENVENIDA}</p>
            <button
              type="button"
              onClick={abrirCarta}
              className="brillo-boton mt-12 inline-flex min-h-14 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-4 text-lg font-medium text-white transition active:scale-95"
            >
              <Heart className="h-5 w-5" aria-hidden />
              {TEXTO_BOTON_BIENVENIDA}
            </button>
          </div>

          {/* Fase 2: frase de la canción brillando en el centro */}
          <div
            aria-live="polite"
            className={`pointer-events-none absolute inset-0 flex items-center justify-center px-10 transition-opacity duration-700 ease-in-out ${
              fase === "transicionando" ? "opacity-100 delay-500" : "opacity-0"
            }`}
          >
            <p className="fuente-serif brillo-texto max-w-xs text-2xl leading-relaxed text-amber-100 italic">
              “{CANCION_ACTIVA.cita}”
            </p>
          </div>
        </div>
      )}

      {/* =============== VISOR DE FOTOS DEL ÁLBUM =============== */}
      {visor !== null && <Visor indice={visor} onCambiar={setVisor} onCerrar={() => setVisor(null)} />}

      {/* =============== MODAL FINAL =============== */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-final"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-5 backdrop-blur-md"
        >
          <div className="animar-modal relative w-full max-w-sm rounded-3xl border border-rose-400/25 bg-gradient-to-b from-slate-900 to-rose-950 p-8 text-center shadow-2xl shadow-rose-950/60">
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              aria-label="Cerrar"
              className="absolute top-3 right-3 rounded-full p-2 text-slate-400 active:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            <Sparkles className="mx-auto mb-3 h-7 w-7 text-amber-400" aria-hidden />
            <h3 id="titulo-final" className="fuente-manuscrita text-4xl text-amber-300">
              {TEXTO_FINAL_TITULO}
            </h3>
            <p className="fuente-serif mt-4 text-lg leading-relaxed text-slate-100">{TEXTO_FINAL}</p>
            <Heart className="animar-latido mx-auto mt-6 h-9 w-9 text-rose-500 drop-shadow-[0_0_14px_rgba(244,63,94,0.7)]" fill="currentColor" strokeWidth={0} aria-hidden />
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => cambiarVista("album")}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-6 py-3 text-sm font-medium text-amber-200 transition active:scale-95 active:bg-amber-400/20"
              >
                <Camera className="h-4 w-4" aria-hidden />
                {TEXTO_ABRIR_ALBUM}
              </button>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="min-h-11 rounded-full bg-white/10 px-8 py-2.5 text-sm text-slate-200 active:bg-white/20"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

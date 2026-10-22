import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ImageIcon, Star } from "lucide-react";
import { CONTENT, type Foto } from "../content";

/** Inclinaciones alternadas para el efecto "fotos pegadas en la pared". */
const TILTS = [-3, 2.5, -2, 3];

/** Tarjeta estilo Polaroid. Si la imagen no existe aún, muestra un placeholder. */
function Polaroid({ foto, index }: { foto: Foto; index: number }) {
  const [error, setError] = useState(false);
  const fromLeft = index % 2 === 0;

  return (
    <motion.figure
      initial={{ opacity: 0, x: fromLeft ? -40 : 40, rotate: 0 }}
      whileInView={{ opacity: 1, x: 0, rotate: TILTS[index % TILTS.length] }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-xs rounded-md bg-stone-50 p-3 pb-5 shadow-2xl shadow-black/50"
    >
      {/* "Cinta adhesiva" decorativa */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 bg-amber-200/70 shadow-sm"
      />

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-slate-200">
        {error ? (
          // Placeholder visible mientras no pongas tu foto
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-rose-200 to-amber-100 p-4 text-center text-rose-700">
            <ImageIcon className="h-10 w-10" aria-hidden />
            <span className="text-sm font-medium">CAMBIAR FOTO AQUÍ</span>
            <code className="text-xs break-all opacity-70">{foto.src}</code>
          </div>
        ) : (
          <img
            src={foto.src}
            alt={foto.alt}
            loading="lazy"
            onError={() => setError(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <figcaption className="mt-4 px-1 text-center">
        {foto.fecha && (
          <span className="mb-1 block text-[0.7rem] font-medium tracking-widest text-rose-500 uppercase">
            {foto.fecha}
          </span>
        )}
        <span className="font-script text-2xl leading-snug text-slate-800">{foto.caption}</span>
      </figcaption>
    </motion.figure>
  );
}

/** Timeline vertical con una línea de corazones y 4 polaroids. */
export default function Gallery() {
  const { titulo, subtitulo, fotos } = CONTENT.galeria;

  return (
    <section className="relative z-10 mx-auto max-w-md px-6 py-20">
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-14 text-center"
      >
        <Star className="mx-auto mb-3 h-6 w-6 text-amber-400" fill="currentColor" strokeWidth={0} aria-hidden />
        <h2 className="font-serif text-3xl font-medium text-slate-50">{titulo}</h2>
        <p className="mt-2 font-script text-2xl text-amber-400">{subtitulo}</p>
      </motion.header>

      <div className="relative space-y-16">
        {/* Línea vertical del timeline */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-1/2 -z-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-rose-500/40 to-transparent"
        />
        {fotos.map((foto, i) => (
          <div key={i} className="relative">
            <Heart
              aria-hidden
              className="absolute -top-8 left-1/2 h-4 w-4 -translate-x-1/2 text-rose-500"
              fill="currentColor"
              strokeWidth={0}
            />
            <Polaroid foto={foto} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}


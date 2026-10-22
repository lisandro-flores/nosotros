import { motion } from "framer-motion";
import { ChevronDown, Heart } from "lucide-react";
import { CONTENT } from "../content";

/** Carta digital: cada párrafo aparece con fade + slide-up al hacer scroll. */
export default function Letter() {
  const { saludo, parrafos, despedida, firma } = CONTENT.carta;

  return (
    <section className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.9 }}
        className="rounded-3xl border border-amber-200/10 bg-slate-800/60 p-7 shadow-2xl shadow-black/30 backdrop-blur-sm"
      >
        <Heart className="mb-4 h-6 w-6 text-rose-500" fill="currentColor" strokeWidth={0} aria-hidden />

        <h2 className="mb-5 font-script text-4xl text-amber-400">{saludo}</h2>

        <div className="space-y-4 font-serif text-[1.05rem] leading-relaxed text-slate-200">
          {parrafos.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {p}
            </motion.p>
          ))}
        </div>

        <div className="mt-8 text-right">
          <p className="font-serif text-sm text-slate-400 italic">{despedida}</p>
          <p className="font-script text-3xl text-rose-400">{firma}</p>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        className="mt-10 flex justify-center text-amber-400/70"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        <ChevronDown className="h-8 w-8" />
      </motion.div>
    </section>
  );
}


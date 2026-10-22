// =====================================================================
//  💌  AQUÍ EDITAS TODO TU CONTENIDO PERSONAL
//  No necesitas tocar los componentes: cambia los textos y rutas de este
//  archivo y listo.
// =====================================================================

export interface Foto {
  /** Ruta de la imagen. Pon tus fotos en /public/fotos/ y usa "/fotos/nombre.jpg" */
  src: string;
  /** Descripción corta de la foto (accesibilidad) */
  alt: string;
  /** Pie de foto: el recuerdo de ese día o lo que te gusta de ella */
  caption: string;
  /** Fecha o lugar (opcional, se muestra pequeño sobre el pie de foto) */
  fecha?: string;
}

export const CONTENT = {
  // ---------------- 1. PANTALLA DE BIENVENIDA ----------------
  splash: {
    // ESCRIBIR TEXTO AQUÍ (opcional): su nombre o apodo, aparece pequeñito arriba
    paraQuien: "Para ti",
    // ESCRIBIR TEXTO AQUÍ: mensaje principal de bienvenida
    mensaje: "Hola. Hice este espacio con mis propias manos solo para ti.",
    boton: "Abrir nuestra historia",
  },

  // ---------------- MÚSICA (opcional) ----------------
  // CAMBIAR CANCIÓN AQUÍ: pon tu MP3 en /public/musica/ y ajusta el nombre.
  // Si el archivo no existe, la página funciona igual (sin música).
  audio: {
    src: "/musica/cancion.mp3",
    volumen: 0.6, // 0 a 1
  },

  // ---------------- 2. CARTA DIGITAL ----------------
  carta: {
    // ESCRIBIR TEXTO AQUÍ: saludo de la carta
    saludo: "Mi amor,",
    // ESCRIBIR TEXTO AQUÍ: cada elemento es un párrafo. Agrega o quita los que quieras.
    // Reemplaza estos textos de ejemplo por TUS palabras, con tus detalles,
    // tus chistes internos y lo que de verdad sientes.
    parrafos: [
      "Hoy no te escribo por costumbre ni por compromiso: te escribo porque te elijo. Hoy, mañana y en todos los planes que me imagino.",
      "Quiero reconocer lo que fue y lo que pudo haber sido mejor. Por eso te propongo algo: borrón y cuenta nueva. Hacer las cosas bien desde la raíz, sin prisas y sin darnos por sentado.",
      "Esto nace de mí, de mi iniciativa y de mis ganas. Estás en mis planes y en mis días, y quiero que lo sepas de la forma más clara posible.",
    ],
    // ESCRIBIR TEXTO AQUÍ: despedida y tu nombre
    despedida: "Con todo mi cariño,",
    firma: "Tu nombre",
  },

  // ---------------- 3. GALERÍA DE MOMENTOS ----------------
  galeria: {
    // ESCRIBIR TEXTO AQUÍ: título de la sección
    titulo: "Nuestros momentos",
    // ESCRIBIR TEXTO AQUÍ: subtítulo
    subtitulo: "Pequeñas cosas que me hacen sonreír",
    fotos: [
      {
        // CAMBIAR FOTO AQUÍ: ruta de la foto 1
        src: "/fotos/foto-1.jpg",
        alt: "Foto 1",
        // ESCRIBIR TEXTO AQUÍ: recuerdo / lo que me gusta de ella en esta foto
        caption: "Aquí escribe el recuerdo de este día.",
        fecha: "Fecha o lugar",
      },
      {
        // CAMBIAR FOTO AQUÍ: ruta de la foto 2
        src: "/fotos/foto-2.jpg",
        alt: "Foto 2",
        // ESCRIBIR TEXTO AQUÍ
        caption: "Aquí escribe qué te gusta de ella en esta imagen.",
        fecha: "Fecha o lugar",
      },
      {
        // CAMBIAR FOTO AQUÍ: ruta de la foto 3
        src: "/fotos/foto-3.jpg",
        alt: "Foto 3",
        // ESCRIBIR TEXTO AQUÍ
        caption: "Aquí escribe otro momento que no quieres olvidar.",
        fecha: "Fecha o lugar",
      },
      {
        // CAMBIAR FOTO AQUÍ: ruta de la foto 4
        src: "/fotos/foto-4.jpg",
        alt: "Foto 4",
        // ESCRIBIR TEXTO AQUÍ
        caption: "Aquí escribe el momento que más te hace sonreír.",
        fecha: "Fecha o lugar",
      },
    ] satisfies Foto[],
  },

  // ---------------- 4. LA GRAN PREGUNTA ----------------
  pregunta: {
    // ESCRIBIR TEXTO AQUÍ: encabezado previo a la pregunta
    encabezado:
      "Quiero empezar este nuevo capítulo como debió ser desde el primer día, naciendo de mí...",
    // ESCRIBIR TEXTO AQUÍ: la pregunta
    pregunta: "¿Quieres ser mi novia en esta nueva etapa?",
    botonSi: "¡Sí, acepto empezar de cero!",
    botonPensar: "Pensarlo",
    // ESCRIBIR TEXTO AQUÍ: frases tiernas que va mostrando el botón "Pensarlo" en cada toque.
    // Al terminar la lista vuelve al texto original.
    frasesPensar: [
      "¿Segura?",
      "Mira que lo programé con mucho cariño",
      "Dale al otro botón ❤️",
    ],
  },

  // ---------------- MENSAJE FINAL (tras decir que sí) ----------------
  final: {
    titulo: "¡Lo sabía! 🥹",
    // ESCRIBIR TEXTO AQUÍ: mensaje final
    mensaje:
      "Prometo cuidarte, darte tu lugar y construir esto juntos. Ahora mírame, que te quiero dar un abrazo.",
    botonCerrar: "Cerrar",
  },
};


# nosotros 💌

SPA mobile-first (React + TypeScript + Tailwind v4). **Toda la versión actual vive en `src/App.tsx`.**

## Personalizar (todo en `src/App.tsx`, constantes al inicio)
- `MODO_CANCION`: `'CHIPINQUE'` (*Cerraron Chipinque - José Madero*) o `'AFLICCION'` (*Nuestra Aflicción - PXNDX*).
- `MODO_AUTOMATICO_INICIAL`: `true` (Modo Cine automático con soporte de scroll manual libre).
- `// MI CARTA AQUÍ`: saludo, párrafos y firma.
- `// CAMBIAR FOTO AQUÍ` / `// ESCRIBIR PIE DE FOTO AQUÍ`: galería de recuerdos.
- Audio y transición: `DURACION_FADE_MS`, `VOLUMEN_FINAL`, `DURACION_TRANSICION_MS`.

## Archivos en `public/`
- `chipinque.mp3` y `afliccion.mp3` (canciones completas de fondo)
- `foto1.webp` … `foto4.webp` (Polaroids principales)
- `album/` (sección independiente del álbum completo)

## Comandos
```bash
npm run dev      # desarrollo (accesible desde el celular en tu red)
npm run build    # genera dist/
```

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// host: true => accesible desde el celular en la misma red (útil para probar el QR)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true },
});


// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Eliminamos el base global para poder usar múltiples landings independientes
  build: {
    assetsPrefix: 'https://lanzadera-digital.b-cdn.net/solsystems.es'
  }
});
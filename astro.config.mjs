// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  base: '/servicios/',
  build: {
    assetsPrefix: 'https://lanzadera-digital.b-cdn.net/solsystems.es'
  }
});

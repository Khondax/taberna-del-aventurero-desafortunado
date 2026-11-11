import { defineConfig, fontProviders } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Escucha en todas las interfaces y acepta cualquier nombre de host (IP local o
  // MagicDNS de Tailscale). Pensado para red privada: no hay autenticación.
  server: { host: true, allowedHosts: true },
  // Las fuentes se descargan al compilar (o al arrancar `pnpm dev`) y se sirven desde
  // la propia app, para que la mesa funcione sin internet. Solo latín y los pesos usados.
  fonts: [
    { provider: fontProviders.google(), name: 'EB Garamond', cssVariable: '--font-garamond', weights: [500, 600, 700], styles: ['normal'], subsets: ['latin'], fallbacks: ['serif'] },
    { provider: fontProviders.google(), name: 'Hanken Grotesk', cssVariable: '--font-hanken', weights: [400, 500, 600, 700], styles: ['normal'], subsets: ['latin'], fallbacks: ['sans-serif'] },
    { provider: fontProviders.google(), name: 'JetBrains Mono', cssVariable: '--font-mono', weights: [500, 600, 700], styles: ['normal'], subsets: ['latin'], fallbacks: ['monospace'] },
  ],
});

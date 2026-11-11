import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Escucha en todas las interfaces y acepta cualquier nombre de host (IP local o
  // MagicDNS de Tailscale). Pensado para red privada: no hay autenticación.
  server: { host: true, allowedHosts: true },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { createCourseBridge } from './scripts/course-bridge';

export default defineConfig({
  plugins: [{ name: 'backend-path-progress', configureServer(server) { server.middlewares.use(createCourseBridge(server.config.root)); }, configurePreviewServer(server) { server.middlewares.use(createCourseBridge(server.config.root)); } }, mdx(), react({ include: /\.(jsx|tsx)$/ })],
  server: { strictPort: true, watch: { ignored: ['**/.lab-check/**'] } },
  build: { target: 'es2022', chunkSizeWarningLimit: 850 },
});

import { build } from 'esbuild';

await build({
  entryPoints: ['scripts/recall-server.ts'], outfile: 'dist-server/recall.cjs',
  bundle: true, platform: 'node', format: 'cjs', target: 'node22',
});

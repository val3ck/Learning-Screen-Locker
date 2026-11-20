import {defineConfig} from 'vite';
export default defineConfig({
  base: './',
  build: {target:'es2022',rollupOptions:{input:{main:'index.html',warning:'warning.html'}}},
  worker: {format:'es'},
  server: {host:'127.0.0.1',port:5173,strictPort:true}
});

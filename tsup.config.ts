import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: 'src/index.ts',
  format: ['esm'],
  entryPoints: [ 'src/index.ts' ]
});

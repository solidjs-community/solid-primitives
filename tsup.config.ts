import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  format: [
    'esm',
    'cjs'
  ],
  entryPoints: [
    'src/index.ts'
  ]
});

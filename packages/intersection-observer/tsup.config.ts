import { defineConfig } from 'tsup';
import defaultConfig from '../../tsup.config';

export default defineConfig((options) => {
  return {
      ...defaultConfig,
      clean: false
  }
});
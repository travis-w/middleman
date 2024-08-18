import { Hijacker } from '@hijacker/core';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, PluginOption } from 'vite';

import { FrontendPlugin } from './src/FrontendPlugin';

const hijacker = (): PluginOption => {
  let hijacker: Hijacker;

  return {
    name: 'hijacker',
    buildStart() {
      if (process.env.STORYBOOK_ACTIVE) {
        hijacker = new Hijacker({
          port: 1234,
          baseRule: {
            baseUrl: 'https://jsonplaceholder.typicode.com/'
          },
          rules: [],
          plugins: [new FrontendPlugin({ port: 2000, devMode: true })]
        });
      }
    },
    buildEnd() {
      if (process.env.STORYBOOK_ACTIVE) {
        hijacker.close();
      }
    }
  };
};

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    visualizer({
      filename: './dist/visualize.html'
    }),
    hijacker()
  ],
  root: './src/frontend',
  build: {
    outDir: '../../dist/frontend',
    // emptyOutDir: true,
    minify: false
  }
});
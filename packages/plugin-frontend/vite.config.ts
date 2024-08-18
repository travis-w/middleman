import { Hijacker } from '@hijacker/core';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, PluginOption } from 'vite';

import { FrontendPlugin } from './src/FrontendPlugin';

const hijacker = (): PluginOption => {
  let hijacker: Hijacker;
  let frontendPlugin: FrontendPlugin;
 
  return {
    name: 'hijacker',
    
    apply(_, { command }) {
      if (command === 'serve') {
        return true;
      }
      return false;
    },

    async buildStart() {
      frontendPlugin = new FrontendPlugin({ port: 2000, devMode: true });
    
      hijacker = new Hijacker({
        port: 1234,
        baseRule: {
          baseUrl: 'https://jsonplaceholder.typicode.com/'
        },
        rules: [{
          name: 'posts',
          body: {
            hello: 'world'
          }
        }],
        logger: {
          level: 'NONE'
        },
        plugins: [frontendPlugin]
      });
    },

    async buildEnd() {
      if (hijacker) {
        await hijacker.close();
      }
  
      if (frontendPlugin) {
        await frontendPlugin.close();
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
import { Hijacker } from '@hijacker/core';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, PluginOption } from 'vite';

import { FrontendPlugin } from './src/FrontendPlugin';

interface HijackerPluginOptions {
  hijackerPort: number;
  frontendPort: number;
}

// TODO: Ideally picks up BE changes. (Need to set up core pacakge.json to export .ts file?)
const hijacker = ({ hijackerPort, frontendPort } : HijackerPluginOptions): PluginOption => {
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
      frontendPlugin = new FrontendPlugin({ port: frontendPort, devMode: true });
    
      hijacker = new Hijacker({
        port: hijackerPort,
        baseRule: {
          baseUrl: 'https://jsonplaceholder.typicode.com/'
        },
        rules: [{
          name: 'posts',
          path: '/posts',
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

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    visualizer({
      filename: './dist/visualize.html'
    }),
    hijacker({
      hijackerPort: 1234, 
      frontendPort: 2000
    })
  ],
  root: './src/frontend',
  build: {
    outDir: '../../dist/frontend',
    emptyOutDir: true,
    minify: false
  },
  define: {
    __APP_TPC_URL__: JSON.stringify(command === 'serve' ? 'http://localhost:2000/trpc' : '/trpc')
  }
}));
import { defineConfig } from '@hijacker/core';
import { FrontendPlugin } from '@hijacker/plugin-frontend';

export default defineConfig({
  port: 3000,
  baseRule: {
    baseUrl: 'https://jsonplaceholder.typicode.com/'
  },
  rules: [{
    name: 'cars',
    path: '/cars',
    body: {
      hello: 'world'
    }
  }],
  plugins: [
    new FrontendPlugin({
      port: 3001
    })
  ]
});
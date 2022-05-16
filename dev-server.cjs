/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const glob = require('glob');
const { green, yellow } = require('colorette');

// Plugin to track build time
const timePlugin = (name) => {
  return {
    name: 'timePlugin',
    setup(build) {
      let buildStart;

      build.onStart(() => {
        buildStart = +new Date();
        console.log(`[${green(name)}] Build started`);
      });

      build.onEnd(() => {
        console.log(`[${green(name)}] Built in: ${yellow(new Date()-buildStart)}ms`);
      });
    }
  };
};

// Very basic hot reload for backend. Just tears everything down before rebuild and starts everything back up after.
// Would be cool to hook this up to a CLI to add new rules/manual restarts and other debug tools
const backendRefresh = () => {
  return {
    name: 'backendRefresh',
    setup(build) {
      let hijackerModule;
      let hijackerServer;

      build.onStart(() => {
        // Clear require cache so everything gets updated correctly
        // Can possibly optimize this to just delete hijacker modules
        Object.keys(require.cache).forEach((x) => {
          delete require.cache[x];
        });

        if (hijackerServer) {
          hijackerServer.close();
          hijackerServer = null;
        }
      });

      build.onEnd(async () => {
        hijackerModule = await import('./dist/hijacker.js');

        hijackerServer = new hijackerModule.Hijacker({
          port: 3000,
          rules: [{
            path: '/cars',
            skipApi: true,
            body: {
              hello: 'world'
            }
          }]
        });
      });
    }
  };
};

(async () => {
  const devServer = process.argv.includes('--dev');
  
  // Backend Build
  esbuild.build({
    entryPoints: glob.sync('src/**/!(*.spec).ts', { ignore: 'src/frontend/**' }),
    outdir: 'dist',
    platform: 'node',
    format: 'esm',
    plugins: [
      timePlugin('server'),
      // Plugins to only run during dev mode
      ...(devServer ? [backendRefresh()] : [])
    ],
    watch: devServer
  }).catch((e) => {
    console.log(e);
  });

  // Frontend Build
  esbuild.build({
    entryPoints: ['src/frontend/index.js'],
    outdir: 'dist/frontend',
    platform: 'browser',
    bundle: true,
    plugins: [timePlugin('client')],
    watch: false,
    loader: { '.js': 'jsx' },
  }).catch((e) => {
    console.log(e);
  });

  // Dist build
  if (!devServer) {
    esbuild.build({
      entryPoints: ['src/bin/hijacker.ts'],
      outdir: 'dist/bin',
      platform: 'node',
      format: 'esm',
      plugins: [timePlugin('bin')],
      watch: false,
      define: {
        HIJACKER_MODULE: '\'../hijacker\''
      }
    }).catch((e) => {
      console.log(e);
    });
  }
})();

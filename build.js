const esbuild = require('esbuild'),
  { dependencies } = require('./package.json');

const buildPackage = async (entry, outdir) => {
  await esbuild.build({
    entryPoints: [entry],
    outdir,
    bundle: true,
    minify: false,
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    keepNames: true,
    allowOverwrite: true,
    external: Object.keys(dependencies),
  });
};

buildPackage('dist/**/*.js', 'dist');

const esbuild = require('esbuild');
const path = require('path');

async function build() {
  console.log('Bundling epic7 worker spike...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'worker.js')],
    bundle: true,
    outfile: path.join(__dirname, 'worker.bundle.js'),
    format: 'iife',
    target: 'es2022',
    loader: {
      '.ts': 'ts',
      '.json': 'json',
    },
  });
  console.log(
    'Worker bundle created successfully at tools/spikes/epic7-worker-csp/worker.bundle.js'
  );
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

import { build } from 'esbuild';
import packageJson from './package.json' assert { type: 'json' };
import fs from 'fs/promises';
import path from 'path';

// Obtener todos los archivos .js en `dist` de forma asincrónica
const getAllJsFiles = async (dir) => {
  let files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = [...files, ...(await getAllJsFiles(fullPath))]; // Recursivamente obtener archivos
    } else if (fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
};

// Carpeta de entrada
const inputDir = 'dist';

// Filtrar dependencias externas
const externalDeps = Object.keys(packageJson.dependencies);

// Construcción de los archivos
const buildFiles = async () => {
  const files = await getAllJsFiles(inputDir);

  // Ejecutar todas las construcciones en paralelo
  const buildPromises = files.map((file) =>
    build({
      entryPoints: [file],
      outfile: file.replace(/\.js$/, '.mjs'), // Genera un archivo .mjs
      format: 'esm', // Convertir a ESM
      bundle: true, // Empaquetar cada archivo con sus dependencias
      platform: 'node',
      target: 'node18',
      allowOverwrite: true,
      sourcemap: true,
      external: externalDeps,
    })
  );

  // Espera a que todas las construcciones finalicen
  await Promise.all(buildPromises);
};

// Ejecutar el proceso de construcción
buildFiles().catch((error) => {
  console.error('Error durante la construcción:', error);
});

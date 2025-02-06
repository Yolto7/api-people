import { build } from 'esbuild';
import packageJson from './package.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path';

// Obtener todos los archivos .js en `dist`
const getAllJsFiles = (dir) => {
  const files = [];

  fs.readdirSync(dir).forEach((item) => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllJsFiles(fullPath)); // Recursivamente obtener archivos de subdirectorios
    } else if (fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  });

  return files;
};

// Carpeta de entrada y salida
const inputDir = 'dist';
const files = getAllJsFiles(inputDir);

files.forEach(async (file) => {
  await build({
    entryPoints: [file],
    outfile: file.replace(/\.js$/, '.mjs'), // Genera un archivo .mjs
    format: 'esm', // Convertir a ESM
    bundle: true, // Empaqueta cada archivo con sus dependencias
    platform: 'node',
    target: 'node18',
    allowOverwrite: true,
    sourcemap: true,
    external: Object.keys(packageJson.dependencies),
  });
});

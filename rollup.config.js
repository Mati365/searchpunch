/* eslint-disable import/no-default-export */
import del from 'rollup-plugin-delete';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  external: [/node_modules/],
  output: [
    {
      file: './dist/cjs/index.js',
      format: 'cjs',
    },
    {
      file: './dist/esm/index.js',
      format: 'esm',
    },
  ],
  plugins: [
    del({
      targets: 'dist/',
    }),
    typescript({
      tsconfig: './tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          module: 'ESNext',
          declaration: true,
        },
        include: ['src/'],
        exclude: ['node_modules/', '**/*.test.tsx', '**/*.test.ts'],
      },
    }),
    resolve({
      moduleDirectories: ['node_modules'],
    }),
  ],
};
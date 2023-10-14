import path from 'node:path';
import { fileURLToPath } from 'url';

export const createJestConfig = ({ rootDir }) => ({
  rootDir,
  preset: 'ts-jest',
  resetMocks: true,
  setupFilesAfterEnv: [
    path.resolve(fileURLToPath(import.meta.url), '../jest.setup.mjs'),
  ],
  testPathIgnorePatterns: ['node_modules'],
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '.test\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest'],
  },
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['index.ts'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
});

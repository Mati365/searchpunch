export const createJestConfig = ({ rootDir }) => ({
  rootDir,
  resetMocks: true,
  extensionsToTreatAsEsm: ['.ts'],
  setupFilesAfterEnv: ['jest-extended'],
  testPathIgnorePatterns: ['node_modules'],
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  testRegex: '.test\\.ts$',
  transformIgnorePatterns: ['<rootDir>/node_modules/', '.mjs'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
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

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // Halve workers: full parallel load flakes heavy 390-metric suites on small boxes (serial always green)
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
  },
};

/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
  // Vitest as test runner
  testRunner: 'vitest',
  testRunnerNodeArgs: ['--experimental-loader=@stryker-mutator/vitest-runner'],

  // TypeScript checker
  checkers: ['typescript'],

  // What to mutate - limited to utils/math for quick results
  mutate: [
    'src/utils/math/**/*.ts',
    '!src/**/__tests__/**',
  ],

  // Mutation report
  reporters: ['clear-text', 'progress'],

  // Performance: increase concurrency for faster runs
  concurrency: 16,

  // Quick start: limit mutators for first run
  // Comment out for full run
  mutator: {
    plugins: [
      'arithmetic',
      'equality',
      'conditional',
      'boolean',
      'logical',
      'string',
    ],
  },

  // Vitest config
  vitest: {
    configFile: 'vitest.config.ts',
  },

  // Thresholds (goals, not blocking)
  thresholds: {
    high: 80,
    low: 60,
    break: 0, // Don't fail build
  },
}

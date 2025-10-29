module.exports = {
  // Test environment for Node.js
  testEnvironment: 'node',

  // Test file patterns
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // Coverage settings
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Setup files
  setupFilesAfterEnv: [],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],

  // Verbose output
  verbose: true,

  // Clear mocks automatically
  clearMocks: true,
};

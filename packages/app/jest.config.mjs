export default {
  // globalSetup: './tests/setup.js',
  // globalTeardown: './tests/teardown.js',
  transform: {
    '\\.js$': 'babel-jest'
  },
  "testTimeout": 115000,
  testEnvironment: 'node',
};

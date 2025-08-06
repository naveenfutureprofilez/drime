module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  transform: {
    '^.+\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
};

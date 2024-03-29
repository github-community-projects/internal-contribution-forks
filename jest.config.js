/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.[tj]sx?$',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test/',
    '<rootDir>/src/utils/',
  ],
}

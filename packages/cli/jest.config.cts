module.exports = {
  displayName: 'cli',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', useESM: true }],
  },
  transformIgnorePatterns: ['node_modules/(?!(commander)/)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/cli',
};

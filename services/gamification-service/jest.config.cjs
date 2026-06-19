/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@swimvault/contracts$': '<rootDir>/../../libs/contracts/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // isolatedModules: 이 서비스는 contracts의 런타임 값(levelForXp 등)을 import하므로
    // 파일 단위 트랜스파일로 교차 rootDir 프로그램 검사를 회피한다.
    '^.+\\.ts$': ['ts-jest', { useESM: true, isolatedModules: true }],
  },
  testMatch: ['**/*.test.ts'],
};

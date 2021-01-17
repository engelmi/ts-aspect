module.exports = {
    moduleFileExtensions: ['js', 'ts'],
    testRegex: '\\.test\\.ts$',
    transform: {
        '^.+\\.(t)s$': 'ts-jest',
    },
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 90,
        },
    },
};

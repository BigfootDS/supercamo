/** @type {import('jest').Config} */
const config = {
	testEnvironment: "node",
	verbose: true,
	maxWorkers: 1,
	detectOpenHandles: true,
	collectCoverageFrom: [
		"dist/*.js",
		"dist/structures/*.js",
		"dist/validators/**/*.js",
		"dist/validators/*.js"
	]
};

module.exports = config;
const util = require('util')
const execFile = util.promisify(require('child_process').execFile)
const {ApiError} = require('./error.js')
const {NodeVM} = require('vm2')

const runSolve = ';\n module.exports = solve\n'

async function runTests(challenge, code) {
	const vm = new NodeVM({
		timeout: challenge.runningTimeoutMs,
	})
	const verifier = vm.run(code + runSolve)
	for (const test of challenge.tests) {
		const result = verifier.apply(null, test.input)
		if (result !== test.output) {
			throw new ApiError(400, `Invalid result for ${test.input}: ${result} should be ${test.output}`)
		}
	}
	return true
}

async function runSandboxed(challenge, code) {
	try {
		const child = await execFile(`${__dirname}/../../bin/run.js`,
			['-i', challenge.id, '-c', code], {timeout: challenge.runningTimeoutMs})
		console.log(child)
	} catch(error) {
		throw new ApiError('400', `Execution failed: ${error}`)
	}
}

module.exports = {runTests, runSandboxed}


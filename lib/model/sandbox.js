const util = require('util')
const execFile = util.promisify(require('child_process').execFile)
const {ApiError} = require('./error.js')

const sandbox = 'global.require = null; global.import = null;\n'
const runSolve = ';\n return solve.apply(null, arguments)\n'

async function runTests(challenge, code) {
	if (code.includes('import')) {
		throw new ApiError('400', 'Code cannot contain import statements')
	}
	const funct = new Function(sandbox + code + runSolve)
	for (const test of challenge.tests) {
		const result = funct.apply(null, test.input)
		if (result !== test.output) {
			throw new ApiError(400, `Invalid result for ${test.input}: ${result} should be ${test.output}`)
		}
	}
	return true
}

async function runSandboxed(challenge, code) {
	try {
		const child = await execFile(`${__dirname}/../../bin/run.js`,
			['-i', challenge.id, '-c', code], {timeout: challenge.maxMinutes * 60 * 1000})
		console.log(child)
	} catch(error) {
		throw new ApiError('400', `Execution failed: ${error}`)
	}
}

module.exports = {runTests, runSandboxed}


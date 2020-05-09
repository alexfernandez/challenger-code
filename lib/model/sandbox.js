const util = require('util')
const execFile = util.promisify(require('child_process').execFile)
const {ApiError} = require('./error.js')
const {NodeVM} = require('vm2')

const runSolve = ';\n module.exports = solve\n'

async function getSandboxedSolver(challenge, code) {
	const vm = new NodeVM({
		timeout: challenge.runningTimeoutMs,
	})
	return await vm.run(code + runSolve)
}

async function runIsolated(challenge, code) {
	try {
		const child = await execFile(`${__dirname}/../../bin/run.js`,
			['-i', challenge.id, '-c', code], {timeout: challenge.runningTimeoutMs})
		return child.stdout
	} catch(error) {
		console.log(error)
		throw new ApiError('400', `Execution failed: ${error}`)
	}
}

module.exports = {getSandboxedSolver, runIsolated}


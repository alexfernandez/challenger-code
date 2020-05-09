const {fork} = require('child_process')
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
		const run = await receiveRun(`${__dirname}/../../bin/run.js`,
			['-i', challenge.id, '-c', code], challenge.runningTimeoutMs)
		return run
	} catch(error) {
		console.log(error)
		throw new ApiError('400', `Execution failed: ${error}`)
	}
}

function receiveRun(file, args, timeout) {
	return new Promise((resolve, reject) => {
		const child = fork(file, args, {}, error => {
			if (error) return reject(error)
		})
		child.on('message', message => {
			resolve(message)
		})
		setTimeout(() => {
			reject(new ApiError(400, 'Timeout'))
			child.kill()
		}, timeout)
	})
}

module.exports = {getSandboxedSolver, runIsolated}


const {fork} = require('child_process')
const {ApiError} = require('./error.js')
const {NodeVM} = require('vm2')

const defaultTimeoutMs = 500

function getSandboxedRunner(code, funcname, timeoutMs) {
	const vm = new NodeVM({
		timeout: timeoutMs || defaultTimeoutMs,
	})
	return vm.run(code + `;\nmodule.exports = ${funcname}`)
}

async function runIsolated(challenge, code) {
	try {
		const run = await receiveRun(`${__dirname}/../../bin/run.js`,
			['-i', challenge.id, '-c', code], challenge.runningTimeoutMs)
		return run
	} catch(error) {
		console.error(error)
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
			child.kill()
			reject(new ApiError(400, 'Timeout'))
		}, timeout)
	})
}

module.exports = {getSandboxedRunner, runIsolated}


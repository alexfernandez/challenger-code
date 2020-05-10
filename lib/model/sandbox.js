const {fork} = require('child_process')
const {ApiError} = require('./error.js')
const {NodeVM} = require('vm2')

const promiseQueue = []

const defaultTimeoutMs = 500

function getSandboxedRunner(code, funcname, timeoutMs) {
	const vm = new NodeVM({
		timeout: timeoutMs || defaultTimeoutMs,
	})
	return vm.run(code + `;\nmodule.exports = ${funcname}`)
}

function runIsolated(challenge, code) {
	const isolation = new Isolation(challenge, code)
	return new Promise((resolve, reject) => {
		promiseQueue.push(callback => {
			isolation.run().then(resolve).catch(reject).finally(callback)
		})
		runPending()
	})
}

function runPending() {
	const first = promiseQueue.shift()
	if (!first) return
	first(runPending)
}

class Isolation {
	constructor(challenge, code) {
		this.challenge = challenge
		this.code = code
	}

	async run() {
		try {
			return await this.receiveRun(`${__dirname}/../../bin/run.js`)
		} catch(error) {
			console.error(error)
			throw new ApiError('400', `Execution failed: ${error}`)
		}
	}

	receiveRun(file) {
		return new Promise((resolve, reject) => {
			const args = ['-i', this.challenge.id, '-c', this.code]
			const child = fork(file, args, {}, error => {
				if (error) return reject(error)
			})
			child.on('message', message => {
				resolve(message)
			})
			setTimeout(() => {
				child.kill()
				reject(new ApiError(400, 'Timeout'))
			}, this.challenge.runningTimeoutMs)
		})
	}
}

module.exports = {getSandboxedRunner, runIsolated}


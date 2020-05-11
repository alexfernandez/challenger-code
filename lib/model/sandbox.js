const {fork} = require('child_process')
const {ApiError} = require('./error.js')
const {NodeVM} = require('vm2')

const promiseQueue = []
let running = false

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
	if (running) return
	if (promiseQueue.length == 0) return
	if (promiseQueue.length > 10) console.log(`Warning: ${promiseQueue.length} runs queued`)
	running = true
	const first = promiseQueue.shift()
	first(() => {
		running = false
		runPending()
	})
}

class Isolation {
	constructor(challenge, code) {
		this.challenge = challenge
		this.code = code
	}

	async run() {
		return await this.receiveRun(`${__dirname}/../../bin/run.js`)
	}

	receiveRun(file) {
		return new Promise((resolve, reject) => {
			const args = ['-i', this.challenge.id, '-c', this.code]
			const child = fork(file, args, {}, error => {
				if (error) return reject(error)
			})
			child.on('message', message => {
				if  (message.error) {
					return reject(new ApiError(400, message.error.stack))
				} else {
					resolve(message)
				}
			})
			child.on('exit', code => {
				if (code == 0) {
					reject(new ApiError(400, 'Exited'))
				} else {
					reject(new ApiError(400, `Exited with error ${code}`))
				}
			})
			setTimeout(() => {
				child.kill()
				reject(new ApiError(400, 'Timeout'))
			}, this.challenge.runningTimeoutMs)
		})
	}
}

module.exports = {getSandboxedRunner, runIsolated}


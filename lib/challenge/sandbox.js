const {fork} = require('child_process')
const {ApiError} = require('../error.js')
const {NodeVM} = require('vm2')

const promiseQueue = []
let running = false
//estimation of the time taken to run a process in isolation
const isolationMs = 500


function getSandboxedRunner(code, funcname, timeoutSeconds) {
	const vm = new NodeVM({
		timeout: timeoutSeconds * 1000,
	})
	return vm.run(`'use strict'\n${code};\nmodule.exports = ${funcname}`)
}

function runIsolated(solution) {
	const isolation = new Isolation({
		challengeId: solution.challenge.id,
		code: solution.code,
		username: solution.username,
		timeoutSeconds: solution.challenge.runningTimeoutSeconds,
	})
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
	constructor(data) {
		this.challengeId = data.challengeId
		this.code = data.code
		this.username  = data.username
		this.timeoutSeconds = data.timeoutSeconds
	}

	async run() {
		return await this.receiveRun(`${__dirname}/../../bin/run.js`)
	}

	receiveRun(file) {
		return new Promise((resolve, reject) => {
			const args = ['-i', this.challengeId, '-c', this.code, '-u', this.username]
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
			}, this.timeoutSeconds * 1000 + isolationMs)
		})
	}
}

module.exports = {getSandboxedRunner, runIsolated}

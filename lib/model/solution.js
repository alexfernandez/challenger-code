const {getSandboxedRunner, runIsolated} = require('./sandbox')
const {Run, Result} = require('./run')


class Solution {
	constructor(challenge, code, username) {
		this.challenge = challenge
		this.username = username
		this.code = code
	}

	async runSandboxed() {
		const timeoutSeconds = this.challenge.runningTimeoutSeconds
		const solver = await getSandboxedRunner(this.code, 'solve', timeoutSeconds)
		const start = Date.now()
		const run = new Run(this)
		const verifications = this.challenge.verifications
		// dry-run first verification just to compile things up
		await this.runVerification(verifications[0], solver)
		for (const verification of verifications) {
			const result = await this.runVerification(verification, solver)
			run.addResult(result)
			if (!run.success) return run
		}
		const elapsed = Date.now() - start
		console.log(`${this.username} run ${this.challenge.name} in ${elapsed} ms`)
		return run
	}

	async runVerification(verification, solver) {
		const start = Date.now()
		const output = await solver.apply(null, verification.input)
		const elapsed = Date.now() - start
		return new Result({
			...verification.sanitize(),
			success: (output === verification.output),
			elapsed,
			actual: output,
		})
	}

	async runIsolated() {
		return await runIsolated(this)
	}
}

module.exports = {Solution}


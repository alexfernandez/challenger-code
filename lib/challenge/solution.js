const {getSandbox, runIsolated} = require('./sandbox')
const {Run, Result} = require('./run')


class Solution {
	constructor(challenge, code, sender) {
		this.challenge = challenge
		this.code = code
		this.sender = sender
	}

	async runSandboxed() {
		const timeoutSeconds = this.challenge.runningTimeoutSeconds
		const solver = await getSandbox(this.code, 'solve', timeoutSeconds)
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
		console.log(`${this.sender} run ${this.challenge.name} in ${elapsed} ms`)
		return run
	}

	async runVerification(verification, solver) {
		const start = Date.now()
		const output = await verification.solveOutput(solver)
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


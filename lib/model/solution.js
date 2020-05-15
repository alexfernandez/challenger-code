const {getSandboxedRunner, runIsolated} = require('./sandbox')
const {Run} = require('./run')


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
		const verifications = this.challenge.verifications
		const run = new Run(this.challenge, this.code)
		// dry-run first verification just to compile things up
		await verifications[0].run(solver)
		for (const verification of verifications) {
			const result = await verification.run(solver)
			run.addResult(result)
			if (!run.success) return run
		}
		const elapsed = Date.now() - start
		console.log(`${this.username} run ${this.challenge.name} in ${elapsed} ms`)
		return run
	}

	async runIsolated() {
		return await runIsolated(this)
	}
}

module.exports = {Solution}


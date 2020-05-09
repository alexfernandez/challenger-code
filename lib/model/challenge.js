const fs = require('fs').promises
const {getSandboxedSolver, runIsolated} = require('./sandbox')
const {ApiError} = require('./error.js')

const challengesById = new Map()
const dir = `${__dirname}/../../challenges/`

class Challenge {
	constructor(data) {
		this.id = data.id
		this.name = data.name
		this.description = data.description
		this.verifications = data.verifications.map(verification => new Verification(verification))
		this.maxMinutes = data.maxMinutes
		this.runningTimeoutMs = data.runningTimeoutMs
	}

	async runSandboxed(code) {
		const solver = await getSandboxedSolver(this, code)
		const run = new Run(this, code)
		for (const verification of this.verifications) {
			const result = await verification.run(solver)
			run.addResult(result)
			if (!run.success) return run
		}
		return run
	}

	async runIsolated(code) {
		return await runIsolated(this, code)
	}
}

class Verification {
	constructor(data) {
		this.name = data.name
		this.input = data.input
		this.output = data.output
	}

	async run(solver) {
		const start = Date.now()
		const output = await solver.apply(null, this.input)
		const elapsed = Date.now() - start
		return new Result({
			...this,
			success: (output === this.output),
			elapsed,
			actual: output,
		})
	}
}

class Run {
	constructor(challenge, code) {
		this.challengeId = challenge.id
		this.code = code
		this.name = challenge.name
		this.verifications = challenge.verifications.length
		this.started = new Date().toISOString()
		this.elapsed = 0
		this.success = true
		this.finished = false
		this.results = []
	}

	addResult(result) {
		this.elapsed += result.elapsed
		if (!result.success) this.success = false
		this.results.push(result)
		if (this.results.length == this.verifications) this.finished = true
	}
}

class Result {
	constructor(data) {
		this.name = data.name
		this.input = data.input
		this.output = data.output
		this.success = data.success
		this.elapsed = data.elapsed
		this.actual = data.actual
	}

	toString() {
		if (!this.run) return `${this.name}: not run`
		if (!this.success) {
			return `❌${this.name}: (${this.input}) => ${this.output} != ${this.expected}`
		}
		return `☑️ ${this.name}: (${this.input}) => ${this.output} in ${this.elapsed} ms`
	}
}

async function readChallenges() {
	const contents = await fs.readdir(dir)
	for (const name of contents) {
		readChallenge(`${dir}/${name}`)
	}
}

async function readChallenge(path) {
	if (!path.endsWith('.json')) {
		return
	}
	const data = require(path)
	const challenge = new Challenge(data)
	challengesById.set(challenge.id, challenge)
}

async function findChallenge(id) {
	if (!challengesById.size) {
		await readChallenges()
	}
	const challenge = challengesById.get(id)
	if (!challenge) throw new ApiError(404, 'Challenge not found')
	return challenge
}

async function addChallenge(data) {
	const challenge = new Challenge(data)
	if (challengesById.has(challenge.id)) throw new ApiError(400, 'Duplicated challenge')
	challengesById.set(challenge.id, challenge)
	return challenge
}

module.exports = {findChallenge, addChallenge}


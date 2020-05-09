const fs = require('fs').promises
const {getSandboxedRunner, runIsolated} = require('./sandbox')
const {Run, Result} = require('./run')
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
		const solver = await getSandboxedRunner(code, 'solve', this.runningTimeoutMs)
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
		this.inited = false
		this.data = data
	}

	async init() {
		for (let i = 0; i < this.input.length; i++) {
			const element = this.input[i]
			if (element in this.data) {
				const runner = await getSandboxedRunner(this.data[element], 'generate')
				this.input[i] = runner()
			}
		}
		this.inited = true
	}

	async run(solver) {
		if (!this.inited) await this.init()
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


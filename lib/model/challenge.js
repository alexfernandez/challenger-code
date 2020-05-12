const fs = require('fs').promises
const {getSandboxedRunner, runIsolated} = require('./sandbox')
const {Run, Result} = require('./run')
const {ApiError} = require('./error.js')

const challengesById = new Map()
const dir = `${__dirname}/../../challenges/`

class Challenge {
	constructor(data) {
		this.id = data.id
		this.category = data.category
		this.name = data.name
		this.description = data.description
		this.verifications = data.verifications.map(verification => new Verification(verification))
		this.maxMinutes = data.maxMinutes
		this.runningTimeoutMs = data.runningTimeoutMs
		this.implementation = data.implementation
		this.requiresInit = true
	}

	sanitize() {
		return {
			id: this.id,
			category: this.category,
			name: this.name,
			description: this.description,
			verifications: this.verifications.filter(v => v.public).map(v => v.sanitize()),
			maxMinutes: this.maxMinutes,
			runningTimeoutMs: this.runningTimeoutMs,
			totalVerifications: this.verifications.length,
		}
	}

	async init() {
		if (!this.requiresInit) return
		const solver = await getSandboxedRunner(this.implementation, 'solve', this.runningTimeoutMs)
		for (const verification of this.verifications) {
			await verification.init(solver)
		}
	}

	async runSandboxed(code) {
		const solver = await getSandboxedRunner(code, 'solve', this.runningTimeoutMs)
		const start = Date.now()
		const run = new Run(this, code)
		// dry-run first verification just to compile things up
		await this.verifications[0].run(solver)
		for (const verification of this.verifications) {
			const result = await verification.run(solver)
			run.addResult(result)
			if (!run.success) return run
		}
		const elapsed = Date.now() - start
		console.log(`Run ${this.name} in ${elapsed} ms`)
		return run
	}

	async runIsolated(code) {
		return await runIsolated(this, code)
	}
}

class Verification {
	constructor(data) {
		this.public = data.public
		this.name = data.name
		this.input = data.input
		this.output = data.output
		this.data = data
	}

	sanitize() {
		return {
			name: this.name,
			input: this.input.map(element => this.sanitizeInput(element)),
			output: this.output,
		}
	}

	sanitizeInput(element) {
		if (!element || !element.length || element.length <= 10) return element
		const shortened = element.slice(0, 5)
		const end = `...(${element.length})`
		if (Array.isArray(shortened)) {
			shortened.push(end)
			return shortened
		}
		else {
			return shortened + end
		}

	}

	async init(solver) {
		for (let i = 0; i < this.input.length; i++) {
			const element = this.input[i]
			if (element in this.data) {
				const runner = await getSandboxedRunner(this.data[element], 'generate')
				this.input[i] = runner()
			}
		}
		if (this.output === undefined) {
			this.output = await solver.apply(null, this.input)
		}
	}

	async run(solver) {
		const start = Date.now()
		const output = await solver.apply(null, this.input)
		const elapsed = Date.now() - start
		return new Result({
			...this.sanitize(),
			success: (output === this.output),
			elapsed,
			actual: output,
		})
	}
}

async function readChallenges() {
	if (challengesById.size) return
	const contents = await fs.readdir(dir)
	for (const name of contents) {
		await readChallenge(`${dir}/${name}`)
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

async function listChallenges() {
	await readChallenges()
	const list = []
	for (const challenge of challengesById.values()) {
		list.push({id: challenge.id, name: challenge.name})
	}
	return list
}

async function findChallenge(id) {
	await readChallenges()
	const challenge = challengesById.get(id)
	if (!challenge) throw new ApiError(404, 'Challenge not found')
	await challenge.init()
	return challenge
}

async function addChallenge(data) {
	const challenge = new Challenge(data)
	if (challengesById.has(challenge.id)) throw new ApiError(400, 'Duplicated challenge')
	challengesById.set(challenge.id, challenge)
	return challenge
}

module.exports = {findChallenge, listChallenges, addChallenge}


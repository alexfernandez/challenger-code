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
		this.tests = data.tests.map(test => new Test(test))
		this.maxMinutes = data.maxMinutes
		this.runningTimeoutMs = data.runningTimeoutMs
	}

	async runSandboxed(code) {
		const solver = await getSandboxedSolver(this, code)
		const results = []
		for (const test of this.tests) {
			const result = await test.run(solver)
			results.push(result)
		}
		return true
	}

	async runIsolated(code) {
		return await runIsolated(this, code)
	}
}

class Test {
	constructor(data) {
		this.input = data.input
		this.output = data.output
	}

	async run(solver) {
		const result = await solver.apply(null, this.input)
		if (result !== this.output) {
			throw new ApiError(400, `Invalid result for ${this.input}: ${result} should be ${this.output}`)
		}
		console.log(`☑️ (${this.input}) => ${this.output}`)
		return true
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
	console.log(`Added challenge ${challenge.name}`)
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


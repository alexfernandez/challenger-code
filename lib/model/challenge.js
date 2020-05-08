const fs = require('fs').promises
const {runTests, runSandboxed} = require('./sandbox')
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
	}

	async run(code) {
		return await runTests(this, code)
	}

	async runSandboxed(code) {
		return await runSandboxed(this, code)
	}
}

class Test {
	constructor(data) {
		this.input = data.input
		this.output = data.output
	}

	run(challenger) {
		const result = challenger.apply(null, this.input)
		if (result !== this.output) {
			throw new ApiError(400, `Invalid result for ${this.input}: ${result} should be ${this.output}`)
		}
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


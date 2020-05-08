const fs = require('fs').promises
const {ApiError} = require('./error.js')

const challenges = new Map()
const dir = `${__dirname}/../../challenges/`


class Challenge {
	constructor(data) {
		this.id = data.id
		this.name = data.name
		this.description = data.description
		this.tests = data.tests.map(test => new Test(test))
		this.maxMinutes = data.maxMinutes
	}
}

class Test {
	constructor(data) {
		this.input = data.input
		this.output = data.output
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
	challenges.set(challenge.id, challenge)
	console.log(`Added challenge ${challenge.name}`)
}

async function findChallenge(id) {
	if (!challenges.size) {
		await readChallenges()
	}
	const challenge = challenges.get(id)
	if (!challenge) throw new ApiError(404, 'Challenge not found')
	return challenge
}

module.exports = {findChallenge}


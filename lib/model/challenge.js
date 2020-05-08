const util = require('util')
const fs = require('fs').promises
const execFile = util.promisify(require('child_process').execFile)
const {ApiError} = require('./error.js')

const challengesById = new Map()
const dir = `${__dirname}/../../challenges/`
const sandbox = 'global.require = null; global.import = null;\n'
const runSolve = ';\n return solve.apply(null, arguments)\n'

class Challenge {
	constructor(data) {
		this.id = data.id
		this.name = data.name
		this.description = data.description
		this.tests = data.tests.map(test => new Test(test))
		this.maxMinutes = data.maxMinutes
	}

	async runSandboxed(code) {
		try {
			const child = await execFile(`${__dirname}/../../bin/run.js`,
				['-i', this.id, '-c', code], {timeout: this.maxMinutes * 60 * 1000})
			console.log(child)
		} catch(error) {
			throw new ApiError('400', `Execution failed: ${error}`)
		}
	}

	async run(code) {
		if (code.includes('import')) {
			throw new ApiError('400', 'Code cannot contain import statements')
		}
		const funct = new Function(sandbox + code + runSolve)
		for (const test of this.tests) {
			const result = funct.apply(null, test.input)
			if (result !== test.output) {
				throw new ApiError(400, `Invalid result for ${test.input}: ${result} should be ${test.output}`)
			}
		}
		return true
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


const {getSandboxedRunner} = require('./sandbox.js')
const {ApiError} = require('./error.js')


const difficulties = [
	'test',
	'entry',
	'easy',
	'medium',
	'hard',
	'impossible',
]

const categories = [
	'test',
	'lists',
	'prefix-pairs',
	'fibonacci',
]

function createChallenge(data) {
	checkChallengeData(data)
	return new Challenge(data)
}

function checkChallengeData(data) {
	if (!data.id || !data.id.length) throw new ApiError(400, 'Invalid challenge id')
	if (!data.username || !data.username.length) throw new ApiError(400, 'Invalid challenge username')
	if (!difficulties.includes(data.difficulty)) throw new ApiError(400, 'Invalid challenge difficulty')
	if (!categories.includes(data.category)) throw new ApiError(400, 'Invalid challenge category')
}

class Challenge {
	constructor(data) {
		this.id = data.id
		this.name = data.name
		this.category = data.category
		this.difficulty = data.difficulty
		this.username = data.username
		this.description = data.description
		this.verifications = data.verifications.map(verification => new Verification(verification))
		this.maxMinutes = data.maxMinutes
		this.runningTimeoutSeconds = data.runningTimeoutSeconds
		this.implementation = data.implementation
		this.requiresInit = true
	}

	async init() {
		if (!this.requiresInit) return
		if (!this.implementation) throw new ApiError(500, 'Missing implementation in challenge')
		const solver = await getSandboxedRunner(this.implementation, 'solve', this.runningTimeoutSeconds)
		for (const verification of this.verifications) {
			await verification.init(solver)
		}
	}

	sanitize() {
		return {
			id: this.id,
			category: this.category,
			name: this.name,
			description: this.description,
			verifications: this.verifications.map(v => v.sanitize()),
			maxMinutes: this.maxMinutes,
			runningTimeoutSeconds: this.runningTimeoutSeconds,
			totalVerifications: this.verifications.length,
		}
	}

	sanitizeForEdit() {
		const sanitized = this.sanitize()
		sanitized.verifications = this.verifications.map(v => v.data)
		delete sanitized.totalVerifications
		return sanitized
	}

	sanitizeForAdmin() {
		const sanitized = this.sanitizeForEdit()
		sanitized.implementation = this.implementation
		return sanitized
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
			public: this.public,
			name: this.name,
			input: this.public ? this.input : '?',
			output: this.public ? this.output : '?',
		}
	}

	async init(solver) {
		this.input = []
		for (let i = 0; i < this.data.input.length; i++) {
			const element = this.data.input[i]
			if (element in this.data) {
				const runner = await getSandboxedRunner(this.data[element], 'generate')
				this.input.push(runner())
			} else {
				this.input.push(element)
			}
		}
		if (this.output === undefined) {
			this.output = await solver.apply(null, this.input)
		}
	}
}

module.exports = {
	createChallenge, Challenge,
	difficulties, categories,
}


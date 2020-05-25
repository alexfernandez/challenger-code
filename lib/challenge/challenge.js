const {getSandbox} = require('./sandbox.js')
const {Verification} = require('./verification.js')
const {ApiError} = require('../error.js')


const difficulties = [
	'test',
	'basic',
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
	if (!data.owner || !data.owner.length) throw new ApiError(400, 'Invalid challenge owner')
	if (!difficulties.includes(data.difficulty)) throw new ApiError(400, 'Invalid challenge difficulty')
	if (!categories.includes(data.category)) throw new ApiError(400, 'Invalid challenge category')
}

class Challenge {
	constructor(data) {
		this.id = data.id
		this.name = data.name
		this.category = data.category
		this.difficulty = data.difficulty
		this.owner = data.owner || 'main'
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
		const solver = await getSandbox(this.implementation, 'solve', this.runningTimeoutSeconds)
		for (const verification of this.verifications) {
			await verification.init(solver)
		}
	}

	sanitize() {
		return {
			id: this.id,
			name: this.name,
			category: this.category,
			difficulty: this.difficulty,
			owner: this.owner || 'Main',
			description: this.description,
			verifications: this.verifications.map(v => v.sanitize()),
			maxMinutes: this.maxMinutes,
			runningTimeoutSeconds: this.runningTimeoutSeconds,
			parameters: this.getParameters(),
		}
	}

	getParameters() {
		if (!this.implementation) return null
		const match = this.description.match(/solve\s*\((.*?)\)/)
		if (!match) return null
		return match[1]
	}

	sanitizeForEdit() {
		const sanitized = this.sanitize()
		sanitized.verifications = this.verifications.map(v => v.data)
		return sanitized
	}

	sanitizeForSave() {
		const sanitized = this.sanitizeForEdit()
		sanitized.implementation = this.implementation
		return sanitized
	}
}

module.exports = {
	createChallenge, Challenge,
	difficulties, categories,
}


const {getSandboxedRunner} = require('./sandbox.js')
const {ApiError} = require('./error.js')


class Challenge {
	constructor(data) {
		this.id = data.id
		this.category = data.category
		this.name = data.name
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
			verifications: this.verifications.filter(v => v.public).map(v => v.sanitize()),
			maxMinutes: this.maxMinutes,
			runningTimeoutSeconds: this.runningTimeoutSeconds,
			totalVerifications: this.verifications.length,
		}
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
}

module.exports = {Challenge}


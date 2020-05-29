const {getSandbox} = require('./sandbox.js')
const {ApiError} = require('../error.js')


class Verification {
	constructor(data) {
		this.public = data.public
		this.name = data.name
		this.input = data.input
		this.parameters = []
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
		const pieces = JSON.parse(`[${this.input}]`)
		for (const piece of pieces) {
			const parameter = await this.generateParameter(piece)
			this.parameters.push(parameter)
		}
		if (this.output === undefined || this.output === null) {
			this.output = await this.solveOutput(solver)
		}
	}

	async generateParameter(piece) {
		if (typeof piece != 'string') return piece
		// variable in ${} starting with a letter, then alphanumeric sequence
		const matches = piece.match(/^\$\{(\p{L}[\p{L}|\p{N}]*)\}$/u)
		if (!matches) return piece
		const variable = matches[1]
		const code = this.data[variable]
		if (!code) {
			throw new ApiError(`Variable ${variable} not found`)
		}
		try {
			return await getSandbox(code, variable)
		} catch(error) {
			throw new ApiError(`Invalid parameter: ${error}`)
		}
	}

	async solveOutput(solver) {
		return await solver.apply(null, this.parameters)
	}
}

module.exports = {Verification}


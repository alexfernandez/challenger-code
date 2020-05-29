const {getSandbox} = require('./sandbox.js')


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
		if (this.output === undefined) {
			this.output = await this.solveOutput(solver)
		}
	}

	async generateParameter(piece) {
		if (typeof piece != 'string') return piece
		// variable in backticks starting with a letter, then alphanumeric sequence
		const match = piece.match(/^`(\p{L}[\p{L}|\p{N}]*)`$/u)
		if (!match || !match[1]) return piece
		const variable = match[1]
		const code = this.data[variable]
		if (!code) {
			console.error(`Variable ${variable} not found`)
			return piece
		}
		try {
			return await getSandbox(code, variable)
		} catch(error) {
			console.error(`Invalid parameter: ${error}`)
			return null
		}
	}

	async solveOutput(solver) {
		return await solver.apply(null, this.parameters)
	}
}

module.exports = {Verification}


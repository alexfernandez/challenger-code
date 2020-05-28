const {getSandbox} = require('./sandbox.js')


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
			const match = element.match(/^`(\w+)`$/)
			if (match && match[1]) {
				const variable = match[1]
				const result = await this.generateInput(variable)
				this.input.push(result)
			} else {
				this.input.push(element)
			}
		}
		if (this.output === undefined) {
			this.output = await this.solveOutput(solver)
		}
	}

	async generateInput(variable) {
		const code = this.data[variable]
		if (!code) {
			console.error(`Variable ${variable} not found`)
			return null
		}
		try {
			const generator = await getSandbox(code, 'generate')
			return generator()
		} catch(error) {
			console.error(`Invalid generate: ${error}`)
			return null
		}
	}

	async solveOutput(solver) {
		try {
			return await solver.apply(null, this.input)
		} catch(error) {
			console.error(`Invalid implementation: ${error}`)
			return null
		}
	}
}

module.exports = {Verification}


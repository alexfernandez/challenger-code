const {parse, walk} = require('abstract-syntax-tree')


class Run {
	constructor(challenge, code) {
		this.challengeId = challenge.id
		this.name = challenge.name
		this.code = code
		this.verifications = challenge.verifications.length
		this.started = new Date().toISOString()
		this.elapsed = 0
		this.success = true
		this.finished = false
		this.results = []
		this.measureSize()
	}

	measureSize() {
		const ast = parse(this.code)
		this.nodes = 0
		walk(ast, () => {
			this.nodes += 1
		})
	}

	addResult(result) {
		this.elapsed += result.elapsed
		if (!result.success) this.success = false
		this.results.push(result)
		if (this.results.length == this.verifications) this.finished = true
	}
}

class Result {
	constructor(data) {
		this.name = data.name
		this.input = data.input
		this.output = data.output
		this.success = data.success
		this.elapsed = data.elapsed
		this.actual = data.actual
		this.sanitize()
	}

	sanitize() {
		for (let i = 0; i < this.input.length; i++) {
			const element = this.input[i]
			if (element && element.length && element.length > 10) {
				const shortened = element.splice(0, 5)
				const end = `...(${element.length})`
				if (Array.isArray(shortened)) {
					shortened.push(end)
					this.input[i] = shortened
				}
				else {
					this.input[i] = shortened + end
				}
			}
		}
	}

	toString() {
		if (!this.run) return `${this.name}: not run`
		if (!this.success) {
			return `❌${this.name}: (${this.input}) => ${this.output} != ${this.expected}`
		}
		return `☑️ ${this.name}: (${this.input}) => ${this.output} in ${this.elapsed} ms`
	}
}

module.exports = {Run, Result}


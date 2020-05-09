

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


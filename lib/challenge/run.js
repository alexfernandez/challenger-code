const AbstractSyntaxTree = require('abstract-syntax-tree')


function createRun(data) {
	return new Run(data)
}

function createFromSolution(solution) {
	const tree = new AbstractSyntaxTree(solution.code)
	return new Run({
		id: solution.challenge.id,
		owner: solution.challenge.owner,
		name: solution.challenge.name,
		code: solution.code,
		sender: solution.sender,
		verifications: solution.challenge.verifications.length,
		started: new Date().toISOString(),
		elapsed: 0,
		success: true,
		finished: false,
		results: [],
		nodes: tree.count(),
	})
}

class Run {
	constructor(data) {
		this.id = data.id
		this.owner = data.owner
		this.name = data.name
		this.code = data.code
		this.sender = data.sender
		this.verifications = data.verifications
		this.started = data.started
		this.elapsed = data.elapsed
		this.success = data.success
		this.finished = data.finished
		this.results = data.results.map(result => new Result(result))
		this.nodes = data.nodes
	}

	addResult(result) {
		this.elapsed += result.elapsed
		if (!result.success) this.success = false
		this.results.push(result)
		if (this.results.length == this.verifications) this.finished = true
	}

	sanitize() {
		return {
			id: this.id,
			owner: this.owner,
			name: this.name,
			code: this.code,
			sender: this.sender,
			verifications: this.verifications,
			started: this.started,
			elapsed: this.elapsed,
			success: this.success,
			finished: this.finished,
			results: this.results.map(result => result.sanitize()),
			nodes: this.nodes,
		}
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

	sanitize() {
		return {
			name: this.name,
			input: [],
			output: this.output,
			success: this.success,
			elapsed: this.elapsed,
			actual: this.actual,
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

module.exports = {createRun, createFromSolution, Result}


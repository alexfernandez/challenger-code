
class ApiError extends Error {
	constructor(code, message) {
		if (typeof code == 'string') {
			message = code
			code = 400
		}
		super(message)
		this.code = code
	}

	toString() {
		return `${this.code}: ${this.message}`
	}
}

class TestError extends Error {
}


module.exports = {ApiError, TestError}


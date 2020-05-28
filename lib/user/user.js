const {ApiError} = require('../error.js')
const bcrypt = require('bcrypt')
const saltFactor = 10


async function createUser(data) {
	checkUserData(data)
	const user = new User(data)
	await user.setPassword(data.password)
	return user
}

function checkUserData(data) {
	if (!checkUsername(data.username)) throw new ApiError(400, `Invalid username`)
	if (!data.email || !data.email.includes('@')) throw new ApiError(400, `Invalid email`)
	if (!data.password || data.password.length <= 8) throw new ApiError(400, `Invalid password`)
	if (data.password != data.confirmPassword) throw new ApiError(400, `Mismatched passwords`)
}

function checkUsername(username) {
	if (!username || !username.length) return false
	if (username.length < 5) return false
	if (username.length > 25) return false
	if (username.match(/\W/)) return false
	if (username.match(/_/)) return false
	return true
}

class User {
	constructor(data) {
		this._id = data._id
		this.username = data.username
		this.email = data.email
		this.password = data.password
		this.role = data.role || 'user'
	}

	async setPassword(password) {
		const salt = await bcrypt.genSalt(saltFactor)
		this.password = await bcrypt.hash(password, salt)
	}

	async update(data) {
		if (data.email) this.email = data.email
		if (data.password) this.setPassword(data.password)
	}

	sanitize() {
		return {
			_id: this._id,
			username: this.username,
			email: this.email,
			role: this.role,
		}
	}

	async sanitizeWithToken(jwt) {
		const sanitized = this.sanitize()
		delete sanitized._id
		delete sanitized.email
		sanitized.token = await jwt.sign(sanitized)
		console.log(sanitized.token)
		return sanitized
	}

	async checkPassword(candidate) {
		const valid = await bcrypt.compare(candidate, this.password)
		if (!valid) throw new ApiError(401, 'Unauthorized')
	}
}

module.exports = {
	createUser, User, checkUsername,
}


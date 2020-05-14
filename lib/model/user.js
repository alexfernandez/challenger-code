const {ApiError} = require('./error.js')
const bcrypt = require('bcrypt')
const saltFactor = 10


async function createUser(data) {
	checkUserData(data)
	const user = new User(data)
	await user.setPassword(data.password)
	return user
}

function checkUserData(data) {
	if (!data.username || !data.username.length
		|| data.username.length < 5 || data.username.includes('@')) {
		throw new ApiError(`Invalid username`)
	}
	if (!data.email || !data.email.includes('@')) {
		throw new ApiError(`Invalid email`)
	}
	if (!data.password || data.password.length <= 8) {
		throw new ApiError(`Invalid password`)
	}
	if (data.password != data.confirmPassword) {
		throw new ApiError(`Mismatched passwords`)
	}
}

async function getUser(data) {
	return new User(data)
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

	async checkPassword(candidate) {
		const valid = await bcrypt.compare(candidate, this.password)
		if (!valid) throw new ApiError(401, 'Unauthorized')
	}
}

module.exports = {
	createUser, getUser,
}


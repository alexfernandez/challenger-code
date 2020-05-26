const {createSecureToken} = require('../token.js')
const {ApiError} = require('../error.js')


async function createAuth(user) {
	const auth = new Auth({
		userId: user._id,
		username: user.username,
		role: user.role,
	})
	await auth.createToken()
	return auth
}


class Auth {
	constructor(data) {
		this._id = data._id
		this.token = data.token
		this.userId = data.userId
		this.username = data.username
		this.role = data.role
	}

	async createToken() {
		this.token = await createSecureToken()
	}

	check() {
		if (!this.token) throw new ApiError(401, 'Unauthorized')
	}

	isAdmin() {
		return this.role == 'admin'
	}

	checkUser(username) {
		if (this.isAdmin()) return
		if (this.username == username) return
		throw new ApiError(401, 'Unauthorized')
	}

	checkAdmin() {
		if (!this.isAdmin()) throw new ApiError(401, 'Unauthorized')
	}

	sanitize() {
		return {
			token: this.token,
			header: `token ${this.token}`,
			username: this.username,
			role: this.role,
		}
	}
}

module.exports = {createAuth, Auth}


const {createSecureToken} = require('../token.js')


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

	isAdmin() {
		return this.role == 'admin'
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


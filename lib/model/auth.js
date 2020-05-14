const {createSecureToken} = require('./token.js')


async function createAuth(user) {
	const auth = new Auth({
		userId: user._id,
		email: user.email,
		role: user.role,
	})
	await auth.createToken()
	return auth
}

function getAuth(data) {
	return new Auth(data)
}


class Auth {
	constructor(data) {
		this._id = data._id
		this.token = data.token
		this.userId = data.userId
		this.email = data.email
		this.role = data.role
	}

	async createToken() {
		this.token = await createSecureToken()
	}

	sanitize() {
		return {
			token: this.token,
			header: `token ${this.token}`,
			email: this.email,
		}
	}
}

module.exports = {
	createAuth, getAuth,
}


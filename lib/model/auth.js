const {createSecureToken} = require('./token.js')


function createAuth(user) {
	const auth = new Auth({
		userId: user._id,
		role: user.role,
	})
	auth.createToken()
	return auth
}

function getAuth(data) {
	return new Auth(data)
}


class Auth {
	constructor(data) {
		this.token = data.token
		this.userId = data.userId
		this.role = data.role
	}

	async createToken() {
		this.token = await createSecureToken()
	}

	getHeader() {
		return `token ${this.token}`
	}
}

module.exports = {
	createAuth, getAuth,
}


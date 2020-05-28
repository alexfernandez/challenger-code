const {ApiError} = require('../error.js')


async function authPlugin(app) {
	app.decorateRequest('isUser', isUser)
	app.decorateRequest('checkUser', checkUser)
	app.decorateRequest('isAdmin', isAdmin)
	app.decorateRequest('checkAdmin', checkAdmin)
	app.decorateRequest('checkUsername', checkUsername)
	app.addHook('preHandler', readAuth)
}

async function readAuth(request) {
	try {
		await request.jwtVerify()
	} catch (error) {
		// no token, no problem
		console.log('no token')
	}
}

function isUser() {
	return !!this.user
}

function checkUser() {
	if (!this.user) throw new ApiError(401, 'Unauthorized')
	return this.user
}

function isAdmin() {
	if (!this.user) return false
	return this.user.role == 'admin'
}

function checkAdmin() {
	if (!isAdmin.apply(this)) throw new ApiError(401, 'Unauthorized')
	return this.user
}

function checkUsername(username) {
	if (isAdmin.apply(this)) return this.user
	const user = checkUser.apply(this)
	if (user.username != username) throw new ApiError(401, 'Unauthorized')
	return user
}

module.exports = {
	authPlugin,
}


const {
	newUser, checkValidUsername,
	readByUsernameOrEmail, readUser, storeUser, deleteUser,
} = require('./db.js')
const {authPlugin} = require('../auth')
const {createSecureToken} = require('../token.js')
const {ApiError} = require('../error.js')


async function userPlugin(app) {
	await authPlugin(app)
	app.post('/signup', signup)
	app.post('/login', login)
	app.get('/:username', showUser)
	app.delete('/:username', removeUser)
}

async function signup(request) {
	const data = request.body
	data.role = 'user'
	const user = await newUser(data)
	return await user.sanitizeForBrowser(this.jwt)
}

async function login(request) {
	console.log('a')
	const user = await readByUsernameOrEmail(request.body)
	console.log('b')
	await user.checkPassword(request.body.password)
	console.log(this.jwt)
	return await user.sanitizeForBrowser(this.jwt)
}

async function loginWithGithub(githubUser, jwt) {
	const email = githubUser.email || `${githubUser.login}@users.noreply.github.com`
	const byEmail = await readUser({email})
	if (byEmail) {
		// login
		return await byEmail.sanitizeForBrowser(jwt)
	}
	if (!await checkValidUsername(githubUser.login)) return null
	// signup
	console.log(githubUser)
	const password = await createSecureToken()
	const data = {
		username: githubUser.login,
		email,
		password,
		confirmPassword: password,
		role: 'user',
	}
	const user = await newUser(data)
	return await user.sanitizeForBrowser(jwt)
}

async function showUser(request) {
	request.checkUsername(request.params.username)
	const user = findUser(request)
	return user.sanitize()
}

async function findUser(request) {
	const user = await readUser({username: request.params.username})
	if (!user) throw new ApiError(404, 'User not found')
	return user.sanitize()
}

async function removeUser(request, reply) {
	request.checkUsername(request.params.username)
	const deleted = await deleteUser({username: request.params.username})
	if (!deleted) throw new ApiError(401, 'Unauthorized')
	reply.statusCode = 204
}

async function makeAdmin(email) {
	const user = await readUser({email})
	if (!user) throw new ApiError(404, 'User not found')
	user.role = 'admin'
	await storeUser(user)
}

module.exports = {userPlugin, findUser, loginWithGithub, makeAdmin}


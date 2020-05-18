const db = require('./db.js')
const {createUser, getUser, checkUsername} = require('./model/user.js')
const {newAuth, checkAuth, removeTokens} = require('./auth.js')
const {createSecureToken} = require('./model/token.js')
const {ApiError} = require('./model/error.js')



async function addUserRoutes(app) {
	app.post('/api/signup', signup)
	app.post('/api/login', login)
	app.get('/api/user/:username', findUser)
	app.delete('/api/user/:username', removeUser)
	await db.createIndex('users', 'username', {unique: true})
	await db.createIndex('users', 'email', {unique: true})
}

async function signup(request) {
	const data = request.body
	data.role = 'user'
	const user = await createUser(data)
	await db.insert('users', user)
	const auth = await newAuth(user)
	return auth.sanitize()
}

async function login(request) {
	const user = await readByUsernameOrEmail(request.body)
	await user.checkPassword(request.body.password)
	const auth = await newAuth(user)
	return auth.sanitize()
}

async function readByUsernameOrEmail(data) {
	const byEmail = await readUser({email: data.email})
	if (byEmail) return byEmail
	const byUsername = await readUser({username: data.email})
	if (byUsername) return byUsername
	throw new ApiError(404, 'User not found')
}

async function readUser(data) {
	const rawUser = await db.read('users', data)
	if (!rawUser) return null
	return getUser(rawUser)
}

async function loginWithGithub(githubUser) {
	const email = githubUser.email || `${githubUser.login}@users.noreply.github.com`
	const byEmail = await readUser({email})
	if (byEmail) {
		// login
		const auth = await newAuth(byEmail)
		return auth.sanitize()
	}
	if (!checkUsername(githubUser.login)) return null
	const byUsername = await readUser({username: githubUser.login})
	if (byUsername) return null
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
	const user = await createUser(data)
	await db.insert('users', user)
	const auth = await newAuth(user)
	return auth
}

async function findUser(request) {
	const raw = await db.read('users', {username: request.params.username})
	if (!raw) throw new ApiError(404, 'User not found')
	const user = await getUser(raw)
	return user.sanitize()
}

async function removeUser(request, reply) {
	const auth = await checkAuth(request)
	if (auth.username != request.params.username) {
		throw new ApiError(401, 'Unauthorized')
	}
	const raw = await db.remove('users', {username: auth.username})
	if (raw.result.n != 1) throw new ApiError(401, 'Unauthorized')
	await removeTokens(auth)
	reply.statusCode = 204
}

async function makeAdmin(email) {
	const user = await db.read('users', {email})
	if (!user) throw new ApiError(404, 'User not found')
	user.role = 'admin'
	await db.update('users', user._id, user)
}

module.exports = {addUserRoutes, findUser, loginWithGithub, makeAdmin}


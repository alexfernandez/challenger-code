const db = require('./db.js')
const {createUser, getUser} = require('./model/user.js')
const {newAuth, checkAuth, removeTokens} = require('./auth.js')
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
	const user = await readUser(request.body)
	await user.checkPassword(request.body.password)
	const auth = await newAuth(user)
	return auth.sanitize()
}

async function readUser(data) {
	const rawEmail = await db.read('users', {email: data.email})
	if (rawEmail) return getUser(rawEmail)
	const rawUsername = await db.read('users', {username: data.email})
	if (rawUsername) return getUser(rawUsername)
	throw new ApiError(404, 'User not found')
}

async function findUser(request) {
	const raw = await db.findOne('users', {username: request.params.username})
	if (!raw) throw new ApiError(404, 'User not found')
	return getUser(raw).sanitize()
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

module.exports = {addUserRoutes, findUser}


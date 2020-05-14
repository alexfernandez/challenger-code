const db = require('./db.js')
const {createUser, getUser} = require('./model/user.js')
const {newAuth, checkAuth, removeTokens} = require('./auth.js')
const {ApiError} = require('./model/error.js')


function addUserRoutes(app) {
	app.post('/api/signup', signup)
	app.post('/api/login', login)
	app.delete('/api/user/:email', removeUser)
	db.createIndex('users', 'email', {unique: true})
}

async function signup(request) {
	const data = request.body
	data.role = 'user'
	const user = await createUser(data)
	await db.insert('users', user)
	const auth = await newAuth(user)
	return auth.sanitize()
}

async function login(request, reply) {
	const user = await readUser({email: request.body.email})
	const valid = await user.comparePassword(request.body.password)
	if (!valid) {
		throw new ApiError(401, 'Unauthorized')
	}
	const auth = await newAuth(reply, user)
	return auth.sanitize()
}

async function readUser(data) {
	const raw = await db.read('users', data)
	if (!raw) throw new ApiError(404, 'User not found')
	return getUser(raw)
}

async function removeUser(request, reply) {
	const auth = await checkAuth(request)
	if (auth.email != request.params.email) {
		throw new ApiError(401, 'Unauthorized')
	}
	const raw = await db.remove('users', {email: auth.email})
	if (raw.result.n != 1) throw new ApiError(401, 'Unauthorized')
	await removeTokens(auth)
	reply.statusCode = 204
}

module.exports = {addUserRoutes}


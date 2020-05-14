const db = require('./db.js')
const {createUser, getUser} = require('./model/user.js')
const {setToken, checkAuth, removeTokens} = require('./auth.js')
const {ApiError} = require('./model/error.js')


function addUserRoutes(app) {
	app.post('/api/signup', signup)
	app.post('/api/login', login)
	app.delete('/api/user/:id', removeUser)
	db.createIndex('users', 'email')
}

async function signup(request, reply) {
	const data = request.body
	console.log(data)
	data.role = 'user'
	const user = await createUser(data)
	await db.insert('users', user)
	await setToken(reply, user)
	return user.sanitize()
}

async function login(request, reply) {
	const user = await readUser({email: request.body.email})
	const valid = await user.comparePassword(request.body.password)
	if (!valid) {
		throw new ApiError(401, 'Unauthorized')
	}
	await setToken(reply, user)
	return user.sanitize()
}

async function readUser(data) {
	const raw = await db.read('users', data)
	if (!raw) throw new ApiError(404, 'User not found')
	return getUser(raw)
}

async function removeUser(request, reply) {
	const auth = await checkAuth(request)
	if (auth.userId != request.params.id) {
		throw new ApiError(401, 'Unauthorized')
	}
	const raw = await db.remove('users', {_id: auth.userId})
	if (raw.result.n != 1) throw new ApiError(401, 'Unauthorized')
	await removeTokens(auth)
	reply.statusCode = 204
}

module.exports = {addUserRoutes}


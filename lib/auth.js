const db = require('./db.js')
const {ApiError} = require('./model/error.js')
const {createAuth, getAuth} = require('./model/auth.js')


function addAuthRoutes() {
	db.createIndex('auth', 'token')
}

async function checkAuth(request) {
	const [method, token] = request.headers['authorization'].split(' ')
	if (method != 'token') throw new ApiError(401, 'Unauthorized')
	const raw = await db.read('auth', {token})
	if (!raw) throw new ApiError(401, `Unauthorized`)
	return getAuth(raw)
}

async function setToken(reply, user) {
	const auth = await createAuth(user)
	await db.insert('auth', auth)
	reply.header('authorization', `token ${auth.token}`)
}

async function removeTokens(user) {
	await db.removeAll('auth', {userId: user._id})
}

module.exports = {
	addAuthRoutes, checkAuth, setToken, removeTokens,
}


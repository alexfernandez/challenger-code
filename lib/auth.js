const db = require('./db/db.js')
const {ApiError} = require('./error.js')
const {createAuth, getAuth} = require('./model/auth.js')


async function addAuthRoutes() {
	await db.createIndex('auth', 'token', {unique: true})
}

async function checkAuth(request) {
	if (!request.headers['authorization']) throw new ApiError(401, 'Unauthorized')
	const [method, token] = request.headers['authorization'].split(' ')
	if (method != 'token') throw new ApiError(401, 'Unauthorized')
	const raw = await db.read('auth', {token})
	if (!raw) throw new ApiError(401, `Unauthorized`)
	return getAuth(raw)
}

async function checkAdmin(request) {
	const auth = await checkAuth(request)
	if (!auth.isAdmin()) throw new ApiError(401, `Unauthorized`)
	return auth
}

async function newAuth(user) {
	const auth = await createAuth(user)
	await db.insert('auth', auth)
	return auth
}

async function removeTokens(user) {
	await db.removeAll('auth', {userId: user._id})
}

module.exports = {
	addAuthRoutes, checkAuth, checkAdmin, newAuth, removeTokens,
}


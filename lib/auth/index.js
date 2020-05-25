const db = require('../db.js')
const {ApiError} = require('../error.js')
const {createAuth, getAuth} = require('./auth.js')


async function readAuth(request) {
	if (!request.headers['authorization']) return null
	const [method, token] = request.headers['authorization'].split(' ')
	if (method != 'token') return null
	const raw = await db.read('auth', {token})
	if (!raw) return null
	return getAuth(raw)
}

async function checkAuth(request) {
	const auth = readAuth(request)
	if (!auth) throw new ApiError(401, 'Unauthorized')
	return auth
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
	readAuth, checkAuth, checkAdmin, newAuth, removeTokens,
}


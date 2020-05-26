const db = require('../db.js')
const {createAuth, Auth} = require('./auth.js')


async function authPlugin(app) {
	app.decorateRequest('readAuth', async function() {
		this.auth = await readAuth(this)
	})
	app.decorateRequest('auth', false)
	app.addHook('preHandler', async(request) => request.readAuth())
}

async function readAuth(request) {
	const noAuth = new Auth({})
	if (!request.headers['authorization']) return noAuth
	const [method, token] = request.headers['authorization'].split(' ')
	if (method != 'token') return noAuth
	const raw = await db.read('auth', {token})
	if (!raw) return noAuth
	return new Auth(raw)
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
	authPlugin, newAuth, removeTokens,
}


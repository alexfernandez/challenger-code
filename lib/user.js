const basicRequest = require('basic-request')
const db = require('./db.js')
const {createUser, getUser} = require('./model/user.js')
const {newAuth, checkAuth, removeTokens} = require('./auth.js')
const {ApiError} = require('./model/error.js')

const homedir = require('os').homedir()
const configuration = require(`${homedir}/.challenger-code.json`)


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
	const user = readByUsernameOrEmail(request.body)
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
	if (!user) return null
	return getUser(rawUser)
}

async function loginWithGithub(request) {
	const token = await basicRequest.post('https://github.com/login/oauth/access_token', {
		client_id: configuration.githubId,
		client_secret: configuration.githubSecret,
		code: request.query.code,
		state: request.query.state,
		redirect_uri: 'http://test.challengerco.de:8474/github-login',
	}, {headers: {accept: 'application/json'}})
	const githubUser = await basicRequest.get('https://api.github.com/user', {}, {headers: {
		Authorization: `token ${token.access_token}`,
	}})
	const existing = readUser({email: githubUser.email})
	if (existing) {
		// login
		return
	}
	const data = {
		username: githubUser.login,
		email: githubUser.email,
		password: token.access_token,
		confirmPassword: token.access_token,
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

module.exports = {addUserRoutes, findUser, loginWithGithub}


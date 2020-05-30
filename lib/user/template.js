const basicRequest = require('basic-request')
const pov = require('point-of-view')
const {resolve} = require('path')
const {findUser, loginWithGithub} = require('./index.js')
const {listChallenges, listSuccesses} = require('../challenge/db.js')
const {createSecureToken} = require('../token.js')


module.exports = async function(app) {
	app.register(pov, {
		engine: {ejs: require('ejs')},
		root: `${__dirname}/../../view`,
		filename: resolve('view'),
	})
	app.get('/user/login', login)
	app.get('/user/signup', signup)
	app.get('/user/settings', viewSettings)
	app.get('/gh/login', showGithubLogin)
	app.get('/:username', viewUser)
}

async function login(request, reply) {
	reply.view('/login.ejs', {
		clientId: request.configuration.githubId,
		state: await createSecureToken(),
	})
	return reply
}

async function signup(request, reply, existing = {}) {
	reply.view('/signup.ejs', {
		clientId: request.configuration.githubId,
		state: await createSecureToken(),
		existing,
	})
	return reply
}

async function viewSettings(request, reply) {
	reply.view('/settings.ejs', {})
	return reply
}

async function showGithubLogin(request, reply) {
	const githubUser = await getGithubUser(request)
	const user = await loginWithGithub(githubUser, this.jwt)
	if (!user) {
		// regular signup
		return signup(request, reply, {
			username: githubUser.login,
			email: githubUser.email,
		})
	}
	reply.view('/github-login.ejs', {user})
	return reply
}

async function getGithubUser(request) {
	const token = await basicRequest.post('https://github.com/login/oauth/access_token', {
		client_id: request.configuration.githubId,
		client_secret: request.configuration.githubSecret,
		code: request.query.code,
		state: request.query.state,
	}, {headers: {accept: 'application/json'}})
	return await basicRequest.get('https://api.github.com/user', {}, {headers: {
		Authorization: `token ${token.access_token}`,
	}})
}

async function viewUser(request, reply) {
	const user = await findUser(request)
	const list = await listChallenges(user.username, {order: 'difficulty'})
	const successes = await listSuccesses(user.username)
	reply.view('/user-page.ejs', {username: user.username, list, successes})
	return reply
}


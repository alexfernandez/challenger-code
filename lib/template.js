const basicRequest = require('basic-request')
const pov = require('point-of-view')
const {resolve} = require('path')
const {findChallenge, listChallenges} = require('./main.js')
const {findUserChallenge} = require('./challenge.js')
const {difficulties, categories} = require('./model/challenge.js')
const {findUser, loginWithGithub} = require('./user.js')
const {createSecureToken} = require('./model/token.js')

const homedir = require('os').homedir()
const configuration = require(`${homedir}/.challenger-code.json`)


function addTemplateRoutes(app) {
	app.register(pov, {
		engine: {ejs: require('ejs')},
		root: `${__dirname}/../view`,
		filename: resolve('view'),
	})
	app.get('/', home)
	app.get('/user/login', login)
	app.get('/user/signup', signup)
	app.get('/user/settings', viewSettings)
	app.get('/gh/login', showGithubLogin)
	app.get('/main/:id', viewChallenge)
	app.get('/main/:id/run', runChallenge)
	app.get('/main/:id/edit', editChallenge)
	app.get('/main/new', createChallenge)
	app.get('/:username', viewUser)
	app.get('/:username/:id/edit', editUserChallenge)
}

async function home(request, reply) {
	const list = await listChallenges({order: 'difficulty'})
	reply.view('/index.ejs', {list})
	return reply
}

async function login(request, reply) {
	reply.view('/login.ejs', {
		clientId: configuration.githubId,
		state: await createSecureToken(),
	})
	return reply
}

async function signup(request, reply, existing = {}) {
	reply.view('/signup.ejs', {
		clientId: configuration.githubId,
		state: await createSecureToken(),
		existing,
	})
	return reply
}

async function viewChallenge(request, reply) {
	console.log('view')
	const challenge = await findChallenge(request.params.id)
	reply.view('/view-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function runChallenge(request, reply) {
	const challenge = await findChallenge(request.params.id)
	reply.view('/run-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function createChallenge(request, reply) {
	return showChallengeEditor('/create-challenge.ejs', {}, reply)
}

async function editChallenge(request, reply) {
	const challenge = await findChallenge(request.params.id)
	return showChallengeEditor('/edit-challenge.ejs', challenge.sanitizeForEdit(), reply)
}

async function editUserChallenge(request, reply) {
	const challenge = await findUserChallenge(request.params.id, request.params.username)
	return showChallengeEditor('/edit-challenge.ejs', challenge.sanitizeForEdit(), reply)
}

async function showChallengeEditor(template, challenge, reply) {
	reply.view(template, {
		challenge,
		difficulties,
		categories,
	})
	return reply
}

async function viewUser(request, reply) {
	const user = await findUser(request)
	reply.view('/user-page.ejs', {user})
	return reply
}

async function viewSettings(request, reply) {
	reply.view('/settings.ejs', {})
	return reply
}

async function showGithubLogin(request, reply) {
	const githubUser = await getGithubUser(request)
	const auth = await loginWithGithub(githubUser)
	if (!auth) {
		// regular signup
		return signup(request, reply, {
			username: githubUser.login,
			email: githubUser.email,
		})
	}
	reply.view('/github-login.ejs', {auth})
	return reply
}

async function getGithubUser(request) {
	const token = await basicRequest.post('https://github.com/login/oauth/access_token', {
		client_id: configuration.githubId,
		client_secret: configuration.githubSecret,
		code: request.query.code,
		state: request.query.state,
	}, {headers: {accept: 'application/json'}})
	return await basicRequest.get('https://api.github.com/user', {}, {headers: {
		Authorization: `token ${token.access_token}`,
	}})
}

module.exports = {addTemplateRoutes}


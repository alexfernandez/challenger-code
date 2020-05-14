const pov = require('point-of-view')
const {resolve} = require('path')
const {
	findChallenge, listChallenges
} = require('./model/challenge.js')
const {findUser} = require('./user.js')


function addTemplateRoutes(app) {
	app.register(pov, {
		engine: {ejs: require('ejs')},
		root: `${__dirname}/../view`,
		filename: resolve('view'),
	})
	app.get('/', home)
	app.get('/login', login)
	app.get('/signup', signup)
	app.get('/challenge/:id/view', viewChallenge)
	app.get('/challenge/:id/run', runChallenge)
	app.get('/username/:username', viewUser)
}

async function home(request, reply) {
	const challenges = await listChallenges()
	reply.view('/index.ejs', {challenges})
	return reply
}

async function login(request, reply) {
	reply.view('/login.ejs', {})
	return reply
}

async function signup(request, reply) {
	reply.view('/signup.ejs', {})
	return reply
}

async function viewChallenge(request, reply) {
	const challenge = await findChallenge(request.params.id)
	reply.view('/view-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function runChallenge(request, reply) {
	const challenge = await findChallenge(request.params.id)
	reply.view('/run-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function viewUser(request, reply) {
	const user = await findUser(request.params.id)
	reply.view('/user-page.ejs', {user: user.sanitize()})
	return reply
}

module.exports = {addTemplateRoutes}


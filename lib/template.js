const pov = require('point-of-view')
const {resolve} = require('path')
const {
	findChallenge, findUserChallenge, listChallenges
} = require('./challenge.js')
const {findUser} = require('./user.js')
const {checkAuth} = require('./auth.js')
const {ApiError} = require('./model/error.js')


function addTemplateRoutes(app) {
	app.register(pov, {
		engine: {ejs: require('ejs')},
		root: `${__dirname}/../view`,
		filename: resolve('view'),
	})
	app.get('/', home)
	app.get('/user/login', login)
	app.get('/user/signup', signup)
	app.get('/view/:id', viewChallenge)
	app.get('/run/:id', runChallenge)
	app.get('/new', createChallenge)
	app.get('/edit/:id', editChallenge)
	app.get('/user/settings', viewSettings)
	app.get('/:username', viewUser)
	app.get('/:username/:id', editUserChallenge)
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

async function createChallenge(request, reply) {
	reply.view('/create-challenge.ejs', {challenge: {}})
	return reply
}

async function editChallenge(request, reply) {
	const challenge = await findChallenge(request.params.id)
	reply.view('/edit-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function editUserChallenge(request, reply) {
	const auth = checkAuth(request)
	if (auth.username != request.params.username) throw new ApiError('Unauthorized')
	const challenge = await findUserChallenge(request.params.id, request.params.username)
	reply.view('/edit-challenge.ejs', {challenge: challenge.sanitize()})
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

module.exports = {addTemplateRoutes}


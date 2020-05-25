const pov = require('point-of-view')
const {resolve} = require('path')
const {findChallenge, listChallenges} = require('./main.js')
const {findUserChallenge} = require('./db.js')
const {difficulties, categories} = require('./challenge.js')
const {readAuth} = require('../auth')


module.exports = async function(app) {
	app.register(pov, {
		engine: {ejs: require('ejs')},
		root: `${__dirname}/../../view`,
		filename: resolve('view'),
	})
	app.get('/', home)
	app.get('/main/:id', viewChallenge)
	app.get('/main/:id/run', runChallenge)
	app.get('/main/:id/edit', editChallenge)
	app.get('/main/new', createChallenge)
	app.get('/:username/:id', viewUserChallenge)
	app.get('/:username/:id/run', runUserChallenge)
	app.get('/:username/:id/edit', editUserChallenge)
}

async function home(request, reply) {
	const list = await listChallenges({order: 'difficulty'})
	reply.view('/index.ejs', {list})
	return reply
}

async function viewChallenge(request, reply) {
	const challenge = await findChallenge(request.params.id)
	reply.view('/view-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function viewUserChallenge(request, reply) {
	const auth = readAuth(request)
	const challenge = await findUserChallenge(request.params.username, request.params.id)
	reply.view('/view-challenge.ejs', {auth, challenge: challenge.sanitize()})
	return reply
}

async function runChallenge(request, reply) {
	const challenge = await findChallenge(request.params.id)
	reply.view('/run-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function runUserChallenge(request, reply) {
	const challenge = await findUserChallenge(request.params.username, request.params.id)
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


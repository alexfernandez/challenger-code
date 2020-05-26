const pov = require('point-of-view')
const {resolve} = require('path')
const {findChallenge, listChallenges} = require('./db.js')
const {difficulties, categories} = require('./challenge.js')


module.exports = async function(app) {
	app.register(pov, {
		engine: {ejs: require('ejs')},
		root: `${__dirname}/../../view`,
		filename: resolve('view'),
	})
	app.get('/', home)
	app.get('/:owner/new', createChallenge)
	app.get('/:owner/:id', viewChallenge)
	app.get('/:owner/:id/run', runChallenge)
	app.get('/:owner/:id/edit', editChallenge)
}

async function home(request, reply) {
	const list = await listChallenges('main', {order: 'difficulty'})
	reply.view('/home.ejs', {username: 'main', list})
	return reply
}

async function viewChallenge(request, reply) {
	const challenge = await findChallenge(request.params.owner, request.params.id)
	reply.view('/view-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function runChallenge(request, reply) {
	const challenge = await findChallenge(request.params.owner, request.params.id)
	reply.view('/run-challenge.ejs', {challenge: challenge.sanitize()})
	return reply
}

async function createChallenge(request, reply) {
	return showChallengeEditor('/create-challenge.ejs', {owner: request.params.owner}, reply)
}

async function editChallenge(request, reply) {
	const challenge = await findChallenge(request.params.owner, request.params.id)
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


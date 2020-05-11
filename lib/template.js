const pov = require('point-of-view')
const {
	findChallenge, listChallenges
} = require('./model/challenge.js')


function addTemplateRoutes(app) {
	app.register(pov, {
		engine: {ejs: require('ejs')},
		root: `${__dirname}/../view`,
	})
	app.get('/', home)
	app.get('/challenge/:id/view', viewChallenge)
	app.get('/challenge/:id/run', runChallenge)
}

async function home(request, reply) {
	const challenges = await listChallenges()
	//reply.type('text/html')
	reply.view('/index.ejs', {challenges})
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

module.exports = {addTemplateRoutes}


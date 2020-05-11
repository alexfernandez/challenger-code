const db = require('./db.js')

const {
	findChallenge, listChallenges
} = require('./model/challenge.js')


function addChallengeRoutes(app) {
	app.get('/api/challenge/:id', showChallenge)
	app.get('/api/challenges', showChallenges)
	app.post('/api/challenge/:id/run', runChallenge)
}

async function showChallenge(request) {
	const challenge = await findChallenge(request.params.id)
	return challenge.sanitize()
}

async function showChallenges() {
	return await listChallenges()
}

async function runChallenge(request) {
	const challenge = await findChallenge(request.params.id)
	const code = request.body.code
	const run = await challenge.runIsolated(code)
	await db.store('runs', run)
	return run
}

module.exports = {addChallengeRoutes}


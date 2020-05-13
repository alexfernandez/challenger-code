const db = require('./db.js')
const {findChallenge, listChallenges} = require('./model/challenge.js')
const {checkAuth} = require('./auth.js')


function addChallengeRoutes(app) {
	app.get('/api/challenge/:id', showChallenge)
	app.get('/api/challenges', showChallenges)
	app.post('/api/challenge/:id/run', runChallenge)
}

async function showChallenges() {
	return await listChallenges()
}

async function showChallenge(request) {
	const challenge = await findChallenge(request.params.id)
	return challenge.sanitize()
}

async function runChallenge(request) {
	const auth = await checkAuth(request)
	const challenge = await findChallenge(request.params.id)
	const code = request.body.code
	const run = await challenge.runIsolated(code)
	run.userId = auth.userId
	await db.insert('runs', run)
	return run
}

module.exports = {addChallengeRoutes}


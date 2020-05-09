const db = require('./db.js')

const {
	findChallenge,
} = require('./model/challenge.js')


function addChallengeRoutes(app) {
	app.get('/challenge/:id', showChallenge)
	app.post('/challenge/:id/run', runChallenge)
}

async function showChallenge(request) {
	return await findChallenge({
		_id: request.params.id,
	})
}

async function runChallenge(request) {
	const challenge = await findChallenge(request.params.id)
	const code = request.body.code
	const run = await challenge.runIsolated(code)
	await db.store('runs', run)
	return run
}

module.exports = {addChallengeRoutes}


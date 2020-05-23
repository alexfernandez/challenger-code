const db = require('./db/db.js')
const {listChallenges, findChallenge, storeChallenge} = require('./main.js')
const {Solution} = require('./model/solution.js')
const {ApiError} = require('./error.js')
const {checkAuth, checkAdmin} = require('./auth.js')


function addChallengeRoutes(app) {
	app.get('/api/challenges/:owner', showChallenges)
	app.get('/api/challenge/:owner/:id', showChallenge)
	app.get('/api/challenge/:owner/:id/edit', editChallenge)
	app.post('/api/challenge/:owner/:id/run', runChallenge)
	app.post('/api/challenge/:owner/:id/save', saveChallenge)
}

async function showChallenges(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	return listChallenges(request.query)
}

async function showChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const challenge = await findChallenge(request.params.id)
	return challenge.sanitize()
}

async function editChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const auth = await checkAuth(request)
	const challenge = await findChallenge(request.params.id)
	if (auth.isAdmin()) {
		return challenge.sanitizeForAdmin()
	}
	return challenge.sanitizeForEdit()
}

async function runChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const auth = await checkAuth(request)
	const challenge = await findChallenge(request.params.id)
	const code = request.body.code
	const solution = new Solution(challenge, code, auth.username)
	const run = await solution.runIsolated()
	const statsQuery = {challengeId: request.params.id, success: true}
	const stats = await db.stats('runs', statsQuery, ['elapsed', 'nodes'])
	await db.insert('runs', run)
	run.stats = stats[0]
	return run
}

async function saveChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	await checkAdmin(request)
	return await storeChallenge(request.body)
}

module.exports = {addChallengeRoutes}


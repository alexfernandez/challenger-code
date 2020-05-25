const {Solution} = require('./solution.js')
const {
	listChallenges, hasChallenge, findChallenge, storeChallenge,
	getRunStats, storeRun,
} = require('./db.js')
const {checkAuth, checkAdmin} = require('../auth')
const {ApiError} = require('../error.js')


module.exports = async function(app) {
	app.get('/:owner/list', showChallenges)
	app.get('/:owner/:id', showChallenge)
	app.post('/:owner/:id/run', runChallenge)
	app.get('/:owner/:id/edit', editChallenge)
	app.post('/:owner/:id/save', saveChallenge)
	app.post('/:owner/:id/fork', forkChallenge)
}

async function showChallenges(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	return listChallenges(request.query)
}

async function showChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const challenge = await findChallenge(request.params.owner, request.params.id)
	return challenge.sanitize()
}

async function editChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const auth = await checkAuth(request)
	const challenge = await findChallenge(request.params.owner, request.params.id)
	if (auth.isAdmin()) {
		return challenge.sanitizeForSave()
	}
	return challenge.sanitizeForEdit()
}

async function runChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const auth = await checkAuth(request)
	const challenge = await findChallenge(request.params.owner, request.params.id)
	const code = request.body.code
	const solution = new Solution(challenge, code, auth.owner)
	const run = await solution.runIsolated()
	run.stats = await getRunStats(run)
	await storeRun(run)
	return run
}

async function saveChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	await checkAdmin(request)
	return await storeChallenge(request.body)
}

async function forkChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const auth = await checkAuth(request)
	if (auth.username != request.body.owner) throw new ApiError(401, 'Unauthorized')
	const existing = await hasChallenge(request.body.owner, request.params.id)
	if (existing) return true
	const challenge = await findChallenge(request.params.owner, request.params.id)
	challenge.owner = request.body.owner
	challenge.implementation = request.body.implementation
	await storeChallenge(challenge.sanitizeForSave())
	return challenge.sanitize()
}


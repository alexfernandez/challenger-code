const {Solution} = require('./solution.js')
const {createChallenge} = require('./challenge.js')
const {
	listChallenges, hasChallenge, findChallenge, storeChallenge,
	getRunStats, storeRun,
} = require('./db.js')
const {checkAuth} = require('../auth')
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
	return listChallenges(request.query)
}

async function showChallenge(request) {
	const challenge = await findChallenge(request.params.owner, request.params.id)
	return challenge.sanitize()
}

async function editChallenge(request) {
	const auth = await checkAuth(request)
	const challenge = await findChallenge(request.params.owner, request.params.id)
	if (auth.isAdmin()) {
		return challenge.sanitizeForSave()
	}
	return challenge.sanitizeForEdit()
}

async function runChallenge(request) {
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
	const auth = await checkAuth(request)
	if (!auth.isAdmin() && auth.username != request.body.username) throw new ApiError(401, 'Unauthorized')
	const challenge = createChallenge(request.body)
	return await storeChallenge(challenge.sanitizeForSave())
}

async function forkChallenge(request) {
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


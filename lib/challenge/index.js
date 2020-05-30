const {Solution, verifyChallenge} = require('./solution.js')
const {createRun} = require('./run.js')
const {createChallenge} = require('./challenge.js')
const {
	listChallenges, hasChallenge, findChallenge, findLastRun,
	storeChallenge, deleteChallenge,
	getRunStats, storeRun,
} = require('./db.js')
const {authPlugin} = require('../auth')
const {ApiError} = require('../error.js')


module.exports = async function(app) {
	await authPlugin(app)
	app.get('/:owner/list', showChallenges)
	app.get('/:owner/:id', showChallenge)
	app.get('/:owner/:id/last', lastRun)
	app.post('/:owner/:id/run', runChallenge)
	app.get('/:owner/:id/edit', editChallenge)
	app.post('/:owner/:id/save', saveChallenge)
	app.post('/:owner/:id/fork', forkChallenge)
	app.delete('/:owner/:id', removeChallenge)
}

async function showChallenges(request) {
	return listChallenges(request.params.owner, request.query)
}

async function showChallenge(request) {
	const challenge = await findChallenge(request.params.owner, request.params.id)
	return challenge.sanitize()
}

async function lastRun(request) {
	const user = request.checkUser()
	const read = await findLastRun({
		owner: request.params.owner,
		id: request.params.id,
		sender: user.username,
	})
	if (!read) return {}
	const run = createRun(read)
	return run.sanitize()
}

async function editChallenge(request) {
	request.checkUsername(request.params.owner)
	const challenge = await findChallenge(request.params.owner, request.params.id)
	return challenge.sanitizeForSave()
}

async function runChallenge(request) {
	request.checkUser()
	const challenge = await findChallenge(request.params.owner, request.params.id)
	const code = request.body.code
	const solution = new Solution(challenge, code, request.user.username)
	const run = await solution.runIsolated()
	const stats = await getRunStats(run)
	await storeRun(run)
	const sanitized = run.sanitize()
	sanitized.stats = stats
	return sanitized
}

async function saveChallenge(request) {
	request.checkUsername(request.body.owner)
	const challenge = createChallenge(request.body)
	await verifyChallenge(challenge, request.user.username)
	return await storeChallenge(challenge)
}

async function forkChallenge(request) {
	request.checkUsername(request.body.owner)
	const existing = await hasChallenge(request.body.owner, request.params.id)
	if (existing) return true
	const challenge = await findChallenge(request.params.owner, request.params.id)
	challenge.origin = `${challenge.owner}/${challenge.id}`
	challenge.owner = request.body.owner
	challenge.implementation = request.body.implementation
	await storeChallenge(challenge)
	return challenge.sanitize()
}

async function removeChallenge(request, reply) {
	request.checkUsername(request.params.owner)
	const deleted = await deleteChallenge({owner: request.params.owner, id: request.params.id})
	if (!deleted) throw new ApiError(404, 'Not found')
	reply.statusCode = 204
}


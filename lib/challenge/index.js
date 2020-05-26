const {Solution} = require('./solution.js')
const {createChallenge} = require('./challenge.js')
const {
	listChallenges, hasChallenge, findChallenge, storeChallenge, deleteChallenge,
	getRunStats, storeRun,
} = require('./db.js')
const {authPlugin} = require('../auth')
const {ApiError} = require('../error.js')


module.exports = async function(app) {
	await authPlugin(app)
	app.get('/:owner/list', showChallenges)
	app.get('/:owner/:id', showChallenge)
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

async function editChallenge(request) {
	request.auth.check()
	const challenge = await findChallenge(request.params.owner, request.params.id)
	if (request.auth.isAdmin()) {
		return challenge.sanitizeForSave()
	}
	return challenge.sanitizeForEdit()
}

async function runChallenge(request) {
	request.auth.check()
	const challenge = await findChallenge(request.params.owner, request.params.id)
	const code = request.body.code
	const solution = new Solution(challenge, code, request.auth.username)
	const run = await solution.runIsolated()
	run.stats = await getRunStats(run)
	await storeRun(run)
	return run
}

async function saveChallenge(request) {
	request.auth.checkUser(request.body.owner)
	const challenge = createChallenge(request.body)
	return await storeChallenge(challenge.sanitizeForSave())
}

async function forkChallenge(request) {
	request.auth.check(request.body.owner)
	const existing = await hasChallenge(request.body.owner, request.params.id)
	if (existing) return true
	const challenge = await findChallenge(request.params.owner, request.params.id)
	challenge.origin = `${challenge.owner}/${challenge.id}`
	challenge.owner = request.body.owner
	challenge.implementation = request.body.implementation
	await storeChallenge(challenge.sanitizeForSave())
	return challenge.sanitize()
}

async function removeChallenge(request, reply) {
	request.auth.checkUser(request.params.owner)
	const deleted = await deleteChallenge({owner: request.params.owner, id: request.params.id})
	if (!deleted) throw new ApiError(404, 'Not found')
	reply.statusCode = 204
}


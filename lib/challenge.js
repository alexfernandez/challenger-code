const db = require('./db.js')
const fs = require('fs').promises
const {Challenge} = require('./model/challenge.js')
const {Solution} = require('./model/solution.js')
const {ApiError} = require('./model/error.js')
const {checkAuth} = require('./auth.js')

const challengesById = new Map()
const dir = `${__dirname}/../challenges/`


function addChallengeRoutes(app) {
	app.get('/api/challenge/:owner/:id', showChallenge)
	app.get('/api/challenges/:owner', showChallenges)
	app.post('/api/challenge/:owner/:id/run', runChallenge)
	app.post('/api/challenge/:owner/:id/save', saveChallenge)
}

async function readChallenges() {
	if (challengesById.size) return
	const contents = await fs.readdir(dir)
	for (const name of contents) {
		await readChallenge(`${dir}/${name}`)
	}
}

async function showChallenges(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	return listChallenges()
}

async function listChallenges() {
	await readChallenges()
	const list = []
	for (const challenge of challengesById.values()) {
		list.push({id: challenge.id, name: challenge.name})
	}
	return list
}

async function showChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const challenge = await findChallenge(request.params.id)
	return challenge.sanitize()
}

async function runChallenge(request) {
	if (request.params.owner != 'main') throw new ApiError(404, 'Invalid owner')
	const auth = await checkAuth(request)
	const challenge = await findChallenge(request.params.id)
	const code = request.body.code
	const solution = new Solution(challenge, code, auth.username)
	const run = await solution.runIsolated()
	await db.insert('runs', run)
	return run
}

async function readChallenge(path) {
	if (!path.endsWith('.json')) {
		return
	}
	const data = require(path)
	const challenge = new Challenge(data)
	challengesById.set(challenge.id, challenge)
}

async function findChallenge(id) {
	await readChallenges()
	const challenge = challengesById.get(id)
	if (!challenge) throw new ApiError(404, 'Challenge not found')
	await challenge.init()
	return challenge
}

module.exports = {addChallengeRoutes, findChallenge, listChallenges}


const db = require('../db.js')
const {Challenge} = require('./challenge.js')
const {listMainChallenges, findMainChallenge, storeMainChallenge} = require('./main.js')
const {ApiError} = require('../error.js')


async function listChallenges({username, order}) {
	if (username == 'main') return await listMainChallenges({order})
	const challenges = await db.list('challenges', {username})
	return challenges.map(challenge => ({
		id: challenge.id,
		name: challenge.name,
		username: challenge.username,
	}))
}

async function findChallenge(username, id) {
	if (username == 'main') return await findMainChallenge(id)
	const rawChallenge = await db.read('challenges', {username, id})
	if (!rawChallenge) throw new ApiError(404, 'Challenge not found.')
	return new Challenge(rawChallenge)
}

async function storeChallenge(challenge) {
	if (challenge.username == 'main') return await storeMainChallenge(challenge)
	await db.insert('challenges', challenge)
}

async function getRunStats(run) {
	const statsQuery = {challengeId: run.challengeId, success: true}
	return await db.stats('runs', statsQuery, ['elapsed', 'nodes'])
}

async function storeRun(run) {
	await db.insert('runs', run)
}

module.exports = {
	listChallenges, findChallenge, storeChallenge,
	getRunStats, storeRun,
}


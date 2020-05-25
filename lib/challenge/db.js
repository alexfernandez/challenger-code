const db = require('../db.js')
const {Challenge} = require('./challenge.js')
const {
	listMainChallenges, hasMainChallenge, findMainChallenge, storeMainChallenge,
	getListing,
} = require('./main.js')
const {ApiError} = require('../error.js')


async function listChallenges(owner, {order}) {
	if (!owner || owner == 'main') return await listMainChallenges({order})
	if (!order) {
		const challenges = await db.list('challenges', {owner})
		return challenges.map(getListing)
	}
	return db.listGrouped('challenges', {owner}, order)
}

async function hasChallenge(owner, id) {
	if (owner == 'main') return await hasMainChallenge(id)
	return !!await db.read('challenges', {owner, id})
}

async function findChallenge(owner, id) {
	if (owner == 'main') return await findMainChallenge(id)
	const rawChallenge = await db.read('challenges', {owner, id})
	if (!rawChallenge) throw new ApiError(404, 'Challenge not found.')
	return new Challenge(rawChallenge)
}

async function storeChallenge(challenge) {
	if (challenge.owner == 'main') return await storeMainChallenge(challenge)
	if (await hasChallenge(challenge.owner, challenge.id)) {
		await db.update('challenges', challenge)
	} else {
		await db.insert('challenges', challenge)
	}
	return true
}

async function deleteChallenge(data) {
	const raw = await db.remove('challenges', data)
	if (raw.result.n != 1) return false
	return true
}

async function getRunStats(run) {
	const statsQuery = {challengeId: run.challengeId, success: true}
	return await db.stats('runs', statsQuery, ['elapsed', 'nodes'])
}

async function storeRun(run) {
	await db.insert('runs', run)
}

module.exports = {
	listChallenges, hasChallenge, findChallenge, storeChallenge, deleteChallenge,
	getRunStats, storeRun,
}


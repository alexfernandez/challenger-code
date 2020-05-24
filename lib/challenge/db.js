const db = require('../db.js')
const {Challenge} = require('./challenge.js')
const {ApiError} = require('../error.js')


async function getRunStats(run) {
	const statsQuery = {challengeId: run.challengeId, success: true}
	return await db.stats('runs', statsQuery, ['elapsed', 'nodes'])
}

async function storeRun(run) {
	await db.insert('runs', run)
}

async function findUserChallenge(username, id) {
	const rawChallenge = await db.read('challenges', {username, id})
	if (!rawChallenge) throw new ApiError(404, 'Challenge not found.')
	return new Challenge(rawChallenge)
}

module.exports = {getRunStats, storeRun, findUserChallenge}


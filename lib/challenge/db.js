const db = require('../db.js')


async function getRunStats(challengeId) {
	const statsQuery = {challengeId, success: true}
	const stats = await db.stats('runs', statsQuery, ['elapsed', 'nodes'])
	await db.insert('runs', run)
	run.stats = stats[0]
	return run
}

module.exports = {getRunStats}


const db = require('../db.js')
const {createChallenge} = require('./challenge.js')
const {
	listMainChallenges, hasMainChallenge, findMainChallenge, storeMainChallenge,
	getListing,
} = require('./main.js')
const {difficulties, categories} = require('./challenge.js')
const {ApiError} = require('../error.js')


async function listChallenges(owner, {order}) {
	if (!owner || owner == 'main') return await listMainChallenges({order})
	if (!order) {
		const challenges = await db.list('challenges', {owner})
		return challenges.map(getListing)
	}
	const groups = await db.listGrouped('challenges', {owner}, order)
	const ordered = {}
	for (const key of getKeys(order)) {
		ordered[key] = groups[key] || []
	}
	return ordered
}

async function listSuccesses(sender) {
	const data = {sender, success: true}
	const group = {
		_id: {$concat: ['$owner', '/', '$id']},
		id: {$last: '$id'},
		owner: {$last: '$owner'},
		name: {$last: '$name'},
		times: {$sum: 1},
	}
	return await db.stats('runs', data, group, ['elapsed', 'nodes'])
}

function getKeys(order) {
	if (order == 'difficulty') return difficulties
	if (order == 'category') return categories
	throw new ApiError(400, 'Invalid order')
}

async function hasChallenge(owner, id) {
	if (owner == 'main') return await hasMainChallenge(id)
	return !!await db.read('challenges', {owner, id})
}

async function findChallenge(owner, id) {
	if (owner == 'main') return await findMainChallenge(id)
	const rawChallenge = await db.read('challenges', {owner, id})
	if (!rawChallenge) throw new ApiError(404, 'Challenge not found.')
	return createChallenge(rawChallenge)
}

async function storeChallenge(challenge) {
	const sanitized = challenge.sanitizeForSave()
	if (sanitized.owner == 'main') return await storeMainChallenge(sanitized)
	if (await hasChallenge(sanitized.owner, sanitized.id)) {
		await db.update('challenges', sanitized, {owner: sanitized.owner, id: sanitized.id})
	} else {
		await db.insert('challenges', sanitized)
	}
	return true
}

async function deleteChallenge(data) {
	const raw = await db.remove('challenges', data)
	if (raw.result.n != 1) return false
	return true
}

async function getRunStats(run) {
	const statsQuery = {id: run.id, success: true}
	const stats = await db.stats('runs', statsQuery, {_id: null}, ['elapsed', 'nodes'])
	return stats[0]
}

async function storeRun(run) {
	await db.insert('runs', run)
}

async function findLastRun(data) {
	return await db.readLast('runs', data)
}

module.exports = {
	listChallenges, listSuccesses,
	hasChallenge, findChallenge, storeChallenge, deleteChallenge,
	getRunStats, storeRun, findLastRun,
}


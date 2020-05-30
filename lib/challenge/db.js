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
	const successes = await db.list('runs', {sender, success: true})
	const byPath = new Map()
	for (const success of successes) {
		const path = `${success.owner}/${success.id}`
		if (!byPath.has(path)) {
			byPath.set(path, [])
		}
		const list = byPath.get(path)
		list.push(success)
	}
	const besties = []
	for (const path of byPath.keys()) {
		const list = byPath.get(path)
		const first = list[0]
		const best = {
			...first,
			elapsedMin: first.elapsed,
			elapsedMax: first.elapsed,
			times: list.length,
		}
		for (const success of list) {
			if (success.elapsed < best.elapsedMin) best.elapsedMin = success.elapsed
			if (success.elapsed > best.elapsedMin) best.elapsedMax = success.elapsed
		}
		besties.push(best)
	}
	return besties
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
	return await db.stats('runs', statsQuery, ['elapsed', 'nodes'])
}

async function storeRun(run) {
	await db.insert('runs', run)
}

module.exports = {
	listChallenges, listSuccesses,
	hasChallenge, findChallenge, storeChallenge, deleteChallenge,
	getRunStats, storeRun,
}


const fs = require('fs').promises
const {Challenge, createChallenge, difficulties, categories} = require('./challenge.js')
const {ApiError} = require('../error.js')

const challengesById = new Map()
const challengesByCategory = new Map()
const challengesByDifficulty = new Map()
const dir = `${__dirname}/../../challenges/`


async function readMainChallenges() {
	if (challengesById.size) return
	for (const difficulty of difficulties) {
		challengesByDifficulty.set(difficulty, [])
	}
	for (const category of categories) {
		challengesByCategory.set(category, [])
	}
	const contents = await fs.readdir(dir)
	for (const name of contents) {
		await readMainChallenge(`${dir}/${name}`)
	}
}

async function readMainChallenge(path) {
	if (!path.endsWith('.json')) {
		return
	}
	const data = require(path)
	const challenge = new Challenge(data)
	addToMaps(challenge)
}

function addToMaps(challenge) {
	challengesById.set(challenge.id, challenge)
	challengesByDifficulty.get(challenge.difficulty).push(challenge)
	challengesByCategory.get(challenge.category).push(challenge)
}

async function listMainChallenges(params = {}) {
	await readMainChallenges()
	if (!params.order) {
		// by id
		return [...challengesById.values()].map(getListing)
	}
	if (params.order == 'difficulty') return getList(challengesByDifficulty)
	if (params.order == 'category') return getList(challengesByCategory)
	throw new ApiError(400, 'Invalid order')
}

function getListing(challenge) {
	return {
		id: challenge.id,
		name: challenge.name,
		username: challenge.username,
	}
}

function getList(map) {
	const object = {}
	for (const [key, value] of map.entries()) {
		object[key] = value.map(getListing)
	}
	return object
}

async function findMainChallenge(id) {
	await readMainChallenges()
	const challenge = challengesById.get(id)
	if (!challenge) throw new ApiError(404, 'Challenge not found')
	await challenge.init()
	return challenge
}

async function storeMainChallenge(data) {
	const challenge = createChallenge(data)
	const filename = `${dir}/${challenge.id}.json`
	const output = JSON.stringify(challenge.sanitizeForSave(), null, '    ')
	await fs.writeFile(filename, output)
	addToMaps(challenge)
	return challenge.sanitize()
}

module.exports = {listMainChallenges, findMainChallenge, storeMainChallenge}


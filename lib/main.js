const fs = require('fs').promises
const {Challenge, createChallenge, difficulties, categories} = require('./model/challenge.js')
const {ApiError} = require('./model/error.js')

const challengesById = new Map()
const challengesByCategory = new Map()
const challengesByDifficulty = new Map()
const dir = `${__dirname}/../challenges/`


async function readChallenges() {
	if (challengesById.size) return
	for (const difficulty of difficulties) {
		challengesByDifficulty.set(difficulty, [])
	}
	for (const category of categories) {
		challengesByCategory.set(category, [])
	}
	const contents = await fs.readdir(dir)
	for (const name of contents) {
		await readChallenge(`${dir}/${name}`)
	}
}

async function readChallenge(path) {
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

async function listChallenges(params = {}) {
	await readChallenges()
	if (!params.order) {
		// by id
		return [...challengesById.values()].map(getListing)
	}
	if (params.order == 'difficulty') return getList(challengesByDifficulty)
	if (params.order == 'category') return getList(challengesByCategory)
	throw new ApiError(400, 'Invalid order')
}

function getListing(challenge) {
	return {id: challenge.id, name: challenge.name}
}

function getList(map) {
	const object = {}
	for (const [key, value] of map.entries()) {
		object[key] = value.map(getListing)
	}
	return object
}

async function findChallenge(id) {
	await readChallenges()
	const challenge = challengesById.get(id)
	if (!challenge) throw new ApiError(404, 'Challenge not found')
	await challenge.init()
	return challenge
}

async function storeChallenge(data) {
	const challenge = createChallenge(data)
	const filename = `${dir}/${challenge.id}.json`
	const output = JSON.stringify(challenge.sanitizeForAdmin(), null, '    ')
	await fs.writeFile(filename, output)
	addToMaps(challenge)
	return challenge.sanitize()
}

module.exports = {listChallenges, findChallenge, storeChallenge}


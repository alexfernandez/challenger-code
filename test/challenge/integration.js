const {expect} = require('chai')
const request = require('basic-request')
const {signup, removeUser} = require('../user/integration.js')
const server = require('../../lib/server.js')
const {TestError} = require('../../lib/error.js')

const port = 9899
const base = `http://localhost:${port}/api/challenge`
const challengeId = 'test'
const code = 'function solve() {return 0}'
const failure = 'function solve() {return 1}'
const wrong = 'function trash() {return 1}'
const timeout = 200
const parallel = `function solve() {return new Promise(resolve => setTimeout(() => resolve(0), ${timeout}))}`

describe('Challenge integration tests', function() {
	this.timeout(10000)
	let app = null
	let headers = null
	let username = null
	before(async() => {
		app = await server.start({port, quiet: true})
		const {user, loggedIn} = await signup()
		username = user.username
		headers = loggedIn
	})
	after(async() => {
		await removeUser()
		await server.stop(app)
	})
	it('should list challenges', async() => {
		const challenges = await request.get(`${base}/main/list`)
		expect(challenges.length).to.be.above(2)
		expect(challenges[0]).to.have.property('id')
		expect(challenges[0]).to.have.property('name')
	})
	it('should list by category and difficulty', async() => {
		for (const order of ['difficulty', 'category']) {
			const challenges = await request.get(`${base}/main/list?order=${order}`)
			expect(challenges).to.have.property('test')
			expect(challenges.test.length).to.be.above(0)
			expect(challenges.test[0]).to.have.property('id')
			expect(challenges.test[0]).to.have.property('name')
		}
	})
	it('should find a challenge', async() => {
		const challenge = await request.get(`${base}/main/${challengeId}`)
		checkChallenge(challenge, challengeId)
	})
	it('should not find non-existing challenge', async() => {
		try {
			await request.get(`${base}/main/fake-test`)
			throw new TestError('Should not find fake test')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should run a challenge', async() => {
		const run = await request.post(`${base}/main/${challengeId}/run`, {code}, headers)
		checkRun(run)
		expect(run.success).to.equal(true)
	})
	it('should fail a challenge', async() => {
		const run = await request.post(`${base}/main/${challengeId}/run`, {code: failure}, headers)
		checkRun(run)
		expect(run.success).to.equal(false)
	})
	it('should reject a challenge', async() => {
		try {
			await request.post(`${base}/main/${challengeId}/run`, {code: wrong}, headers)
			throw new TestError('Should not run this trash')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should run challenges in parallel', async() => {
		const promises = []
		for (let i = 0; i < 5; i++) {
			const promise = request.post(`${base}/main/${challengeId}/run`, {code: parallel}, headers)
			promises.push(promise)
		}
		const start = Date.now()
		const runs = await Promise.all(promises)
		const elapsed = Date.now() - start
		for (const run of runs) {
			checkRun(run)
			expect(run.success).to.equal(true)
		}
		// 3 tests per run
		expect(elapsed).to.be.above(3 * timeout * runs.length)
	})
	it('should fork a challenge', async() => {
		const forked = await request.post(`${base}/main/${challengeId}/fork`, {owner: username, code}, headers)
		expect(forked).to.have.property('owner')
		expect(forked.owner).to.equal(username)
		const list = await request.get(`${base}/${username}/list`)
		expect(list.length).to.equal(1)
		expect(list[0].id).to.equal(challengeId)
		expect(list[0].owner).to.equal(username)
		const challenge = await request.get(`${base}/${username}/${challengeId}`)
		expect(challenge).to.have.property('origin')
		expect(challenge.origin).to.equal(`main/${challengeId}`)
		for (const order of ['difficulty', 'category']) {
			const challenges = await request.get(`${base}/${username}/list?order=${order}`)
			expect(challenges).to.have.property('test')
			expect(challenges.test.length).to.equal(1)
			expect(challenges.test[0].id).to.equal(challengeId)
			expect(challenges.test[0]).to.have.property('name')
			expect(challenges.test[0].owner).to.equal(username)
		}
	})
})

function checkChallenge(challenge, id) {
	expect(challenge.id).to.equal(id)
	expect(challenge).to.have.property('name')
	expect(challenge).to.not.have.property('implementation')
	expect(challenge.verifications).to.be.an('array')
	expect(challenge.verifications.length).to.equal(2)
}

function checkRun(run) {
	expect(run.challengeId).to.equal(challengeId)
	expect(run).to.have.property('name')
	expect(run).to.have.property('code')
	expect(run.verifications).to.be.a('number')
	expect(run.results).to.be.an('array')
}


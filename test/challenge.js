const {expect} = require('chai')
const request = require('basic-request')
const server = require('../lib/server.js')
const {TestError} = require('../lib/model/error.js')

const port = 9899
const base = `http://localhost:${port}/api`
const challengeId = 'test'
const code = 'function solve() {return 0}'
const failure = 'function solve() {return 1}'
const wrong = 'function trash() {return 1}'
const timeout = 200
const parallel = `function solve() {return new Promise(resolve => setTimeout(() => resolve(0), ${timeout}))}`

describe('Challenge integration tests', function() {
	this.timeout(5000)
	let app = null
	before(async() => {
		app = await server.start({port, quiet: true})
	})
	after(async() => {
		await server.stop(app)
	})
	it('should list challenges', async() => {
		const challenges = await request.get(`${base}/challenges`)
		expect(challenges.length).to.be.above(2)
		expect(challenges[0]).to.have.property('id')
		expect(challenges[0]).to.have.property('name')
	})
	it('should find a challenge', async() => {
		const challenge = await request.get(`${base}/challenge/${challengeId}`)
		checkChallenge(challenge, challengeId)
	})
	it('should run a challenge', async() => {
		const run = await request.post(`${base}/challenge/${challengeId}/run`, {code})
		checkRun(run)
		expect(run.success).to.equal(true)
	})
	it('should fail a challenge', async() => {
		const run = await request.post(`${base}/challenge/${challengeId}/run`, {code: failure})
		checkRun(run)
		expect(run.success).to.equal(false)
	})
	it('should reject a challenge', async() => {
		try {
			await request.post(`${base}/challenge/${challengeId}/run`, {code: wrong})
			throw new TestError('Should not run this trash')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should run challenges in parallel', async() => {
		const promises = []
		for (let i = 0; i < 5; i++) {
			const promise = request.post(`${base}/challenge/${challengeId}/run`, {code: parallel})
			promises.push(promise)
		}
		const start = Date.now()
		const runs = await Promise.all(promises)
		const elapsed = Date.now() - start
		for (const run of runs) {
			checkRun(run)
			expect(run.success).to.equal(true)
		}
		// 2 tests per run
		expect(elapsed).to.be.above(2 * timeout * runs.length)
		console.log(runs)
		console.log(elapsed)
	})
})

function checkChallenge(challenge, id) {
	expect(challenge.id).to.equal(id)
	expect(challenge).to.have.property('name')
	expect(challenge).to.not.have.property('implementation')
	expect(challenge.verifications).to.be.an('array')
	expect(challenge.verifications.length).to.equal(1)
}

function checkRun(run) {
	expect(run.challengeId).to.equal(challengeId)
	expect(run).to.have.property('name')
	expect(run).to.have.property('code')
	expect(run.verifications).to.be.a('number')
	expect(run.results).to.be.an('array')
}


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
const parallel = 'function solve() {return new Promise(resolve => setTimeout(() => resolve(0), 200))}'

describe('Challenge integration tests', () => {
	let app = null
	before(async() => {
		app = await server.start({port, quiet: true})
	})
	after(async() => {
		await server.stop(app)
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
	it.only('should run challenges in parallel', async() => {
		const promise1 = request.post(`${base}/challenge/${challengeId}/run`, {code: parallel})
		const promise2 = request.post(`${base}/challenge/${challengeId}/run`, {code: parallel})
		const start = Date.now()
		const runs = await Promise.all([promise1, promise2])
		const elapsed = Date.now() - start
		checkRun(runs[0])
		expect(runs[0].success).to.equal(true)
		checkRun(runs[1])
		expect(runs[1].success).to.equal(true)
		expect(elapsed).to.be.above(800)
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


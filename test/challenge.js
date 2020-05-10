const {expect} = require('chai')
const request = require('basic-request')
const server = require('../lib/server.js')
const {TestError} = require('../lib/model/error.js')

const port = 9899
const challengeId = 'test'
const code = 'function solve() {return 0}'
const failure = 'function solve() {return 1}'
const wrong = 'function trash() {return 1}'
const base = `http://localhost:${port}`

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
		checkRun(run, challengeId)
		expect(run.success).to.equal(true)
	})
	it('should fail a challenge', async() => {
		const run = await request.post(`${base}/challenge/${challengeId}/run`, {code: failure})
		checkRun(run, challengeId)
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
})

function checkChallenge(challenge, id) {
	expect(challenge.id).to.equal(id)
	expect(challenge).to.have.property('name')
	expect(challenge).to.have.property('implementation')
}

function checkRun(run, id) {
	expect(run.challengeId).to.equal(id)
	expect(run).to.have.property('name')
	expect(run).to.have.property('code')
	expect(run.verifications).to.be.a('number')
	expect(run.results).to.be.an('array')
}


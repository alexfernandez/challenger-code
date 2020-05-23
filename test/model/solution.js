const {expect} = require('chai')
const {ApiError, TestError} = require('../../lib/error.js')
const {Solution} = require('../../lib/model/solution.js')
const {createTestToken} = require('../../lib/model/token.js')
const {createChallenge} = require('./challenge.js')

const username = `pap${createTestToken()}`


describe('Solution model tests', function() {
	this.timeout(5000)
	let challenge = null
	before(async() => {
		challenge = await createChallenge()
	})
	it('should run challenge', async() => {
		const right = new Solution(challenge, 'function solve() {return 0}', username)
		const successful = await right.runSandboxed()
		expect(successful.success).to.equal(true)
		expect(successful.username).to.equal(username)
		const wrong = new Solution(challenge, 'function solve() {return 1}', username)
		const failed = await wrong.runSandboxed()
		expect(failed.success).to.equal(false)
		expect(failed.username).to.equal(username)
	})
	it('should reject malicious code', async() => {
		try {
			const solution = new Solution(challenge, `const fs = require("fs");
			const solve = () => fs.readFileSync("/etc/resolv.conf")`)
			await solution.runSandboxed()
		} catch(error) {
			expect(error.constructor.name).to.equal('VMError')
		}
		try {
			const solution = new Solution(challenge, `import {readFileSync} from "fs";
			const solve = () => fs.readFileSync("/etc/resolv.conf")`)
			await solution.runSandboxed()
		} catch(error) {
			expect(error).to.be.instanceof(SyntaxError)
		}
	})
	it('should run in a separate process', async() => {
		const right = new Solution(challenge, 'function solve() {return 0}', username)
		const successful = await right.runIsolated()
		expect(successful.success).to.equal(true)
		expect(successful.username).to.equal(username)
		const wrong = new Solution(challenge, 'function solve() {return 1}', username)
		const failed = await wrong.runIsolated()
		expect(failed.success).to.equal(false)
		expect(failed.username).to.equal(username)
		try {
			const isolated = new Solution(challenge, 'function solve() {while (true){}}', username)
			await isolated.runIsolated()
			throw new TestError('Should not finish infinite loop')
		} catch(error) {
			console.error(error)
			expect(error).to.be.instanceof(ApiError)
		}
	})
})


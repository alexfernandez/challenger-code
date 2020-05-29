const {expect} = require('chai')
const {ApiError, TestError} = require('../../lib/error.js')
const db = require('../../lib/db.js')
const {Solution} = require('../../lib/challenge/solution.js')
const {storeChallenge, deleteChallenge} = require('../../lib/challenge/db.js')
const {createTestToken} = require('../../lib/token.js')
const {createTestChallenge} = require('./challenge.js')

const sender = `pap${createTestToken()}`


describe('Solution model tests', function() {
	this.timeout(5000)
	let challenge = null
	before(async() => {
		challenge = await createTestChallenge()
		await db.start()
	})
	after(async() => {
		await db.stop()
	})
	it('should run challenge', async() => {
		const right = new Solution(challenge, 'function solve() {return 0}', sender)
		const successful = await right.runSandboxed()
		expect(successful.success).to.equal(true)
		expect(successful.sender).to.equal(sender)
		const wrong = new Solution(challenge, 'function solve() {return 1}', sender)
		const failed = await wrong.runSandboxed()
		expect(failed.success).to.equal(false)
		expect(failed.sender).to.equal(sender)
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
		await storeChallenge(challenge)
		try {
			const right = new Solution(challenge, 'function solve() {return 0}', sender)
			const successful = await right.runIsolated()
			expect(successful.success).to.equal(true)
			expect(successful.sender).to.equal(sender)
			const wrong = new Solution(challenge, 'function solve() {return 1}', sender)
			const failed = await wrong.runIsolated()
			expect(failed.success).to.equal(false)
			expect(failed.sender).to.equal(sender)
			try {
				const isolated = new Solution(challenge, 'function solve() {while (true){}}', sender)
				await isolated.runIsolated()
				throw new TestError('Should not finish infinite loop')
			} catch(error) {
				console.error(error)
				expect(error).to.be.instanceof(ApiError)
			}
		} finally {
			await deleteChallenge(challenge)
		}
	})
})


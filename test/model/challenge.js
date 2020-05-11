const {expect} = require('chai')
const {ApiError, TestError} = require('../../lib/model/error.js')
const {listChallenges, findChallenge} = require('../../lib/model/challenge.js')


describe('Challenge model tests', () => {
	it('should list challenges', async() => {
		const challenges = await listChallenges()
		expect(challenges.length).to.be.above(2)
	})
	it('should find and run existing challenge', async() => {
		const challenge = await findChallenge('test')
		expect(challenge.id).to.equal('test')
		const successful = await challenge.runSandboxed('function solve() {return 0}')
		expect(successful.success).to.equal(true)
		const failed = await challenge.runSandboxed('function solve() {return 1}')
		expect(failed.success).to.equal(false)
	})
	it('should not find non-existing challenge', async() => {
		try {
			await findChallenge('fake-test')
			throw new TestError('Should not be found')
		} catch(error) {
			expect(error).to.be.instanceof(ApiError)
		}
	})
	it('should reject malicious code', async() => {
		const challenge = await findChallenge('test')
		try {
			await challenge.runSandboxed(`const fs = require("fs");
			const solve = () => fs.readFileSync("/etc/resolv.conf")`)
			throw new TestError('Should not run require()')
		} catch(error) {
			expect(error.constructor.name).to.equal('VMError')
		}
		try {
			await challenge.runSandboxed(`import {readFileSync} from "fs";
			const solve = () => fs.readFileSync("/etc/resolv.conf")`)
			throw new TestError('Should not run import')
		} catch(error) {
			expect(error).to.be.instanceof(SyntaxError)
		}
	})
	it('should run in a separate process', async() => {
		const challenge = await findChallenge('test')
		const successful = await challenge.runIsolated('function solve() {return 0}')
		expect(successful.success).to.equal(true)
		const failed = await challenge.runIsolated('function solve() {return 1}')
		expect(failed.success).to.equal(false)
		try {
			await challenge.runIsolated('function solve() {while (true){}}')
			throw new TestError('Should not finish infinite loop')
		} catch(error) {
			console.error(error)
			expect(error).to.be.instanceof(ApiError)
		}
	})
})


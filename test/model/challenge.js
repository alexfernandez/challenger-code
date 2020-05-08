const {expect} = require('chai')
const {ApiError, TestError} = require('../../lib/model/error.js')
const {findChallenge} = require('../../lib/model/challenge.js')


describe('Challenge model tests', () => {
	it('should find and run existing challenge', async() => {
		const challenge = await findChallenge('test')
		expect(challenge.id).to.equal('test')
		challenge.run('function solve() {return 0}')
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
			await challenge.run(`const fs = require("fs");
			const solve = () => fs.readFileSync("/etc/resolv.conf")`)
			throw new TestError('Should not run require()')
		} catch(error) {
			expect(error.constructor.name).to.equal('VMError')
		}
		try {
			await challenge.run(`import {readFileSync} from "fs";
			const solve = () => fs.readFileSync("/etc/resolv.conf")`)
			throw new TestError('Should not run import')
		} catch(error) {
			expect(error).to.be.instanceof(SyntaxError)
		}
	})
	it('should run in a separate process', async() => {
		const challenge = await findChallenge('test')
		await challenge.runSandboxed('function solve() {return 0}')
		try {
			await challenge.runSandboxed('function solve() {return 1}')
		} catch(error) {
			console.error(error)
			expect(error).to.be.instanceof(ApiError)
		}
	})
})


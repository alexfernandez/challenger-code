const {expect} = require('chai')
const {ApiError, TestError} = require('../../lib/model/error.js')
const {findChallenge} = require('../../lib/model/challenge.js')


describe('Challenge model tests', () => {
	it('should find existing challenge', async() => {
		const challenge = await findChallenge('test')
		expect(challenge.id).to.equal('test')
	})
	it('should not find non-existing challenge', async() => {
		try {
			await findChallenge('fake-test')
			throw new TestError('Should not be found')
		} catch(error) {
			expect(error).to.be.instanceof(ApiError)
		}
	})
})


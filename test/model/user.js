const {expect} = require('chai')
const {ApiError, TestError} = require('../../lib/model/error.js')
const {createUser} = require('../../lib/model/user.js')
const {createTestToken} = require('../../lib/model/token.js')

const email = `pep-${createTestToken()}@test.com`
const password = 'asdf12345'
const data = {
	email,
	password,
	confirmPassword: password,
}

describe('User model tests', () => {
	let user = null
	it('should create user', async() => {
		user = await createUser(data)
		expect(user.role).to.equal('user')
		expect(user).to.have.property('email')
		expect(user).to.have.property('password')
		expect(user.password).to.not.equal(password)
		user.comparePassword(password)
	})
	it('should reject empty user', async() => {
		try {
			await createUser({})
			throw new TestError('Empty user')
		} catch(error) {
			expect(error).to.be.instanceof(ApiError)
		}
	})
	it('should reject invalid user', async() => {
		try {
			await createUser({email, password, confirmPassword: 'churro'})
			throw new TestError('Invalid user')
		} catch(error) {
			expect(error).to.be.instanceof(ApiError)
		}
	})
	it('should reject invalid password', async() => {
		try {
			await createUser({email, password: '456', confirmPassword: '456'})
			throw new TestError('Invalid password')
		} catch(error) {
			expect(error).to.be.instanceof(ApiError)
		}
	})
	it('should reject invalid password', async() => {
		try {
			await user.comparePassword(password + 'pop')
			throw new TestError('Invalid login')
		} catch(error) {
			expect(error).to.be.instanceof(ApiError)
		}
	})
})


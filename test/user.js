const {expect} = require('chai')
const request = require('basic-request')
const server = require('../lib/server.js')
const {createTestToken} = require('../lib/model/token.js')
const {TestError} = require('../lib/model/error.js')

const port = 9899
const base = `http://localhost:${port}`
const email = `pip-${createTestToken()}@test.com`
const password = 'asdf12345'
const data = {
	email,
	password,
	confirmPassword: password,
}

describe('User integration tests', () => {
	let app = null
	let headers = null
	before(async() => {
		app = await server.start({port, quiet: true})
	})
	after(async() => {
		await server.stop(app)
	})
	it('should sign up a new user', async() => {
		const parsed = await request.getParsed(`${base}/signup`, 'POST', data)
		const user = parsed.body
		data._id = user._id
		checkUser(user)
		expect(parsed.headers).to.have.property('authorization')
		headers = {headers: {authorization: parsed.headers.authorization}}
	})
	it('should reject duplicated email', async() => {
		try {
			await request.post(`${base}/signup`, data)
			throw new TestError('Duplicated email')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should login user', async() => {
		const parsed = await request.getParsed(`${base}/login`, 'POST', {email, password})
		checkUser(parsed.body)
		expect(parsed.headers).to.have.property('authorization')
	})
	it('should reject invalid logins', async() => {
		try {
			await request.post(`${base}/login`, {email, password: `${password}pop`})
			throw new TestError('Invalid login')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
		const newEmail = `pip-${createTestToken()}@test.com`
		try {
			await request.post(`${base}/login`, {email: newEmail, password})
			throw new TestError('Invalid login')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should remove user', async() => {
		await request.delete(`${base}/user/${data._id}`, '', headers)
	})
})

function checkUser(user) {
	expect(user.email).to.equal(email)
	expect(user.role).to.equal('user')
	expect(user).to.not.have.property('password')
}


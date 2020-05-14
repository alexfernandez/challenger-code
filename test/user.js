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
let headers = null

describe('User integration tests', () => {
	let app = null
	before(async() => {
		app = await server.start({port, quiet: true})
	})
	after(async() => {
		await server.stop(app)
	})
	it('should sign up a new user', async() => {
		const {auth, loggedIn} = await signup()
		checkAuth(auth)
		expect(loggedIn.headers).to.have.property('authorization')
	})
	it('should reject duplicated email', async() => {
		try {
			await request.post(`${base}/api/signup`, data)
			throw new TestError('Duplicated email')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should login user', async() => {
		const auth = await request.post(`${base}/api/login`, {email, password})
		checkAuth(auth)
	})
	it('should reject invalid logins', async() => {
		try {
			await request.post(`${base}/api/login`, {email, password: `${password}pop`})
			throw new TestError('Invalid login')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
		const newEmail = `pip-${createTestToken()}@test.com`
		try {
			await request.post(`${base}/api/login`, {email: newEmail, password})
			throw new TestError('Invalid login')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should remove user', async() => {
		await removeUser()
	})
})

async function signup() {
	const auth = await request.post(`${base}/api/signup`, data)
	const loggedIn = {headers: {authorization: auth.header}}
	headers = loggedIn
	return {auth, loggedIn}
}

async function removeUser() {
	await request.delete(`${base}/api/user/${data.email}`, '', headers)
}

function checkAuth(auth) {
	expect(auth.email).to.equal(email)
	expect(auth).to.have.property('header')
	expect(auth).to.not.have.property('password')
}

module.exports = {signup, removeUser}


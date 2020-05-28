const {expect} = require('chai')
const request = require('basic-request')
const server = require('../../lib/server.js')
const {createTestToken} = require('../../lib/token.js')
const {TestError} = require('../../lib/error.js')

const port = 9899
const base = `http://localhost:${port}`
const username = `pip${createTestToken()}`
const email = `${username}@test.com`
const password = 'asdf12345'
const data = {
	email,
	password,
	username,
	confirmPassword: password,
}
let headers = null

describe.only('User integration tests', () => {
	let app = null
	before(async() => {
		app = await server.start({port, quiet: true})
	})
	after(async() => {
		await server.stop(app)
	})
	it('should sign up a new user', async() => {
		const {user, loggedIn} = await signup()
		checkUser(user)
		expect(loggedIn.headers).to.have.property('authorization')
	})
	it('should reject duplicated email', async() => {
		try {
			await request.post(`${base}/api/user/signup`, {
				...data,
				username: username + 'fedro',
			})
			throw new TestError('Duplicated email')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should reject duplicated username', async() => {
		try {
			await request.post(`${base}/api/user/signup`, {
				...data,
				email: email + 'mies',
			})
			throw new TestError('Duplicated username')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should login user', async() => {
		console.log(1)
		const userByEmail = await request.post(`${base}/api/user/login`, {email, password})
		console.log(2)
		checkUser(userByEmail)
		console.log(3)
		const userByUsername = await request.post(`${base}/api/user/login`, {email: username, password})
		console.log(4)
		checkUser(userByUsername)
	})
	it('should reject invalid logins', async() => {
		try {
			await request.post(`${base}/api/user/login`, {email, password: `${password}pop`})
			throw new TestError('Invalid login')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
		const newEmail = `pip-${createTestToken()}@test.com`
		try {
			await request.post(`${base}/api/user/login`, {email: newEmail, password})
			throw new TestError('Invalid login')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should find correct user', async() => {
		const user = await request.get(`${base}/api/user/${username}`)
		expect(user.username).to.equal(username)
		expect(user.email).to.equal(email)
		expect(user).to.not.have.property('password')
		try {
			await request.get(`${base}/api/user/${username}fedro`)
			throw new TestError('Invalid username')
		} catch(error) {
			expect(error.constructor.name).to.equal('RequestError')
		}
	})
	it('should remove user', async() => {
		await removeUser()
	})
})

async function signup() {
	const user = await request.post(`${base}/api/user/signup`, data)
	const loggedIn = {headers: {authorization: user.token}}
	headers = loggedIn
	return {user, loggedIn}
}

async function removeUser() {
	await request.delete(`${base}/api/user/${data.username}`, '', headers)
}

function checkUser(user) {
	expect(user.username).to.equal(username)
	expect(user).to.have.property('token')
	expect(user).to.not.have.property('_id')
	expect(user).to.not.have.property('password')
	expect(user).to.not.have.property('email')
}

module.exports = {signup, removeUser}


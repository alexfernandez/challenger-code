const db = require('./db.js')
const {createUser, getUser, checkUsername} = require('../model/user.js')
const {ApiError} = require('../model/error.js')



async function createUserIndexes() {
	await db.createIndex('users', 'username', {unique: true})
	await db.createIndex('users', 'email', {unique: true})
}

async function newUser(data) {
	const user = await createUser(data)
	await db.insert('users', user)
	return user
}

async function checkValidUsername(username) {
	if (!checkUsername(username)) return false
	const byUsername = await readUser({username})
	if (byUsername) return false
	return true
}

async function readByUsernameOrEmail(data) {
	const byEmail = await readUser({email: data.email})
	if (byEmail) return byEmail
	const byUsername = await readUser({username: data.email})
	if (byUsername) return byUsername
	throw new ApiError(404, 'User not found')
}

async function readUser(data) {
	const rawUser = await db.read('users', data)
	if (!rawUser) return null
	return getUser(rawUser)
}

async function storeUser(user) {
	await db.update('users', user._id, user)
}

async function deleteUser(data) {
	const raw = await db.remove('users', data)
	if (raw.result.n != 1) return false
	return true
}

module.exports = {
	createUserIndexes, newUser, checkValidUsername,
	readByUsernameOrEmail, readUser, storeUser, deleteUser,
}


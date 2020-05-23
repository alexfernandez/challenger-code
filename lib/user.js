const {
	createUserIndexes, newUser, checkValidUsername,
	readByUsernameOrEmail, readUser, storeUser, deleteUser,
} = require('./db/user.js')
const {newAuth, checkAuth, removeTokens} = require('./auth.js')
const {createSecureToken} = require('./model/token.js')
const {ApiError} = require('./error.js')



async function addUserRoutes(app) {
	app.post('/api/signup', signup)
	app.post('/api/login', login)
	app.get('/api/user/:username', findUser)
	app.delete('/api/user/:username', removeUser)
	await createUserIndexes()
}

async function signup(request) {
	const data = request.body
	data.role = 'user'
	const user = await newUser(data)
	const auth = await newAuth(user)
	return auth.sanitize()
}

async function login(request) {
	const user = await readByUsernameOrEmail(request.body)
	await user.checkPassword(request.body.password)
	const auth = await newAuth(user)
	return auth.sanitize()
}

async function loginWithGithub(githubUser) {
	const email = githubUser.email || `${githubUser.login}@users.noreply.github.com`
	const byEmail = await readUser({email})
	if (byEmail) {
		// login
		const auth = await newAuth(byEmail)
		return auth.sanitize()
	}
	if (!await checkValidUsername(githubUser.login)) return null
	// signup
	console.log(githubUser)
	const password = await createSecureToken()
	const data = {
		username: githubUser.login,
		email,
		password,
		confirmPassword: password,
		role: 'user',
	}
	const user = await newUser(data)
	const auth = await newAuth(user)
	return auth
}

async function findUser(request) {
	const user = await readUser({username: request.params.username})
	if (!user) throw new ApiError(404, 'User not found')
	return user.sanitize()
}

async function removeUser(request, reply) {
	const auth = await checkAuth(request)
	if (auth.username != request.params.username) {
		throw new ApiError(401, 'Unauthorized')
	}
	const deleted = await deleteUser({username: auth.username})
	if (!deleted) throw new ApiError(401, 'Unauthorized')
	await removeTokens(auth)
	reply.statusCode = 204
}

async function makeAdmin(email) {
	const user = await readUser({email})
	if (!user) throw new ApiError(404, 'User not found')
	user.role = 'admin'
	await storeUser(user)
}

module.exports = {addUserRoutes, findUser, loginWithGithub, makeAdmin}


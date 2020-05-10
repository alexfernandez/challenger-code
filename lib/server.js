const fastify = require('fastify')
const {addChallengeRoutes} = require('./challenge.js')
const {ApiError} = require('./model/error.js')
const db = require('./db.js')


async function start(options = {}) {
	await db.start(options.mongodb)
	const app = create(options)
	app.get('/', home)
	addChallengeRoutes(app)
	await app.listen(options.port)
	return app
}

async function stop(app) {
	await db.stop()
	await app.close()
}

async function home() {
	return '<!DOCTYPE html><html><body><h1>Challenger Code</h1><p>Challenge yourself!</p></body></html>'
}

function create(options) {
	const app = fastify({logger: {level: options.quiet ? 'error' : 'info'}})
	app.setErrorHandler(async (error, request, reply) => {
		if (error instanceof ApiError) {
			reply.status(error.code)
		} else {
			reply.status(400)
		}
		request.log.error(error)
		return {error: String(error)}
	})
	return app
}

module.exports = {start, stop}


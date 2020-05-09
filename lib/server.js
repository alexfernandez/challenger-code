const fastify = require('fastify')
const {addChallengeRoutes} = require('./challenge.js')
const {ApiError} = require('./model/error.js')
const db = require('./db.js')


async function startServer(options = {}) {
	await db.start(options.mongodb)
	const app = create(options)
	addChallengeRoutes(app)
	await app.listen(options.port)
	return app
}

async function stopServer(app) {
	await db.stop()
	await app.close()
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

module.exports = {startServer, stopServer}


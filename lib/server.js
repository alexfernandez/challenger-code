const fastify = require('fastify')
const fastifyStatic = require('fastify-static')
const {addChallengeRoutes} = require('./challenge.js')
const {addTemplateRoutes} = require('./template.js')
const {ApiError} = require('./model/error.js')
const db = require('./db.js')


async function start(options = {}) {
	await db.start(options.mongodb)
	const app = create(options)
	app.register(fastifyStatic, {
		root: `${__dirname}/../public/js`,
		prefix: '/js',
		decorateReply: false,
	})
	app.register(fastifyStatic, {
		root: `${__dirname}/../public/img`,
		prefix: '/img',
		decorateReply: false,
	})
	addChallengeRoutes(app)
	addTemplateRoutes(app)
	await app.listen(options.port, '127.0.0.1')
	return app
}

async function stop(app) {
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

module.exports = {start, stop}


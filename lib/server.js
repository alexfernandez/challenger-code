const fastify = require('fastify')
const fastifyStatic = require('fastify-static')
const challengePlugin = require('./challenge')
const templatePlugin = require('./template.js')
const {userPlugin} = require('./user')
const {ApiError} = require('./error.js')
const db = require('./db')

const staticDirs = ['js', 'img', 'css']

async function start(options = {}) {
	await db.start(options.mongodb)
	await db.createIndexes()
	const app = create(options)
	for (const dir of staticDirs) {
		app.register(fastifyStatic, {
			root: `${__dirname}/../public/${dir}`,
			prefix: `/${dir}`,
			decorateReply: false,
		})
	}
	await app.register(challengePlugin, {prefix: '/api/challenge'})
	await app.register(userPlugin, {prefix: '/api/user'})
	await app.register(templatePlugin, {prefix: '/'})
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


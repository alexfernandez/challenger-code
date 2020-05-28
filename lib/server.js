const fastify = require('fastify')
const fastifyStatic = require('fastify-static')
const fastifyJwt = require('fastify-jwt')
const challengePlugin = require('./challenge')
const challengeTemplatePlugin = require('./challenge/template.js')
const {userPlugin} = require('./user')
const userTemplatePlugin = require('./user/template.js')
const {ApiError} = require('./error.js')
const db = require('./db')

const homedir = require('os').homedir()
const configuration = require(`${homedir}/.challenger-code.json`)
const staticDirs = ['js', 'img', 'css']

async function start(options = {}) {
	await db.start(options.mongodb)
	const app = create(options)
	app.decorateRequest('config', configuration)
	await app.register(fastifyJwt, {
		secret: configuration.jwtSecret,
		algorithms: ['RS256'],
	})
	for (const dir of staticDirs) {
		app.register(fastifyStatic, {
			root: `${__dirname}/../public/${dir}`,
			prefix: `/${dir}`,
			decorateReply: false,
		})
	}
	await app.register(challengePlugin, {prefix: '/api/challenge'})
	await app.register(userPlugin, {prefix: '/api/user'})
	await app.register(challengeTemplatePlugin, {prefix: '/'})
	await app.register(userTemplatePlugin, {prefix: '/'})
	await app.listen(options.port, '127.0.0.1')
	return app
}

async function stop(app) {
	await db.stop()
	await app.close()
}

function create(options) {
	const app = fastify({logger: !options.quiet})
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


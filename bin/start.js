const stdio = require('stdio')
const server = require('../lib/server.js')

const options = stdio.getopt({
	port: {key: 'p', args: 1, description: 'Server port', default: 8474},
	quiet: {key: 'q', description: 'Do not show traces'},
	mongodb: {key: 'm', description: 'MongoDB connection string', default: 'mongodb://localhost/cc'}
})

server.start(options).catch(error => console.error(`Could not start server: ${error} ${error.stack}`))


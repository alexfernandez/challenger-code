#!/usr/bin/env node

const stdio = require('stdio')
const {runChallenge} = require('../lib/runner.js')

const options = stdio.getopt({
	owner: {key: 'o', args: 1, description: 'Challenge owner'},
	challengeId: {key: 'i', args: 1, description: 'Challenge identifier'},
	code: {key: 'c', args: 1, description: 'Code for the challenge'},
	sender: {key: 's', args: 1, description: 'Name of user sending'},
	mongodb: {key: 'm', args: 1, description: 'MongoDB connection string', default: 'mongodb://localhost/cc'},
	quiet: {key: 'q', description: 'Do not pipe output'},
})
console.log(options)

runChallenge(options).catch(error => {
	if (process.send) {
		process.send({error: {message: error.message, stack: error.stack}})
	} else {
		console.error(`Could not run challenge: ${error} ${error.stack}`)
	}
	process.exit(1)
})


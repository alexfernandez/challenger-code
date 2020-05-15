#!/usr/bin/env node

const stdio = require('stdio')
const {runChallenge} = require('../lib/runner.js')

const options = stdio.getopt({
	id: {key: 'i', args: 1, description: 'Challenge identifier'},
	code: {key: 'c', args: 1, description: 'Code for the challenge'},
	username: {key: 'u', args: 1, description: 'Name of user running'},
	quiet: {key: 'q', description: 'Do not pipe output'},
})

runChallenge(options).catch(error => {
	if (process.send) {
		process.send({error: {message: error.message, stack: error.stack}})
	} else {
		console.error(`Could not run challenge: ${error} ${error.stack}`)
	}
	process.exit(1)
})


#!/usr/bin/env node

const stdio = require('stdio')
const {runChallenge} = require('../lib/sandbox.js')

const options = stdio.getopt({
	id: {key: 'i', args: 1, description: 'Challenge identifier'},
	code: {key: 'c', args: 1, description: 'Code for the challenge'},
	quiet: {key: 'q', description: 'Do not pipe output'},
})

runChallenge(options).catch(error => {
	console.error(`Could not run challenge: ${error} ${error.stack}`)
	process.exit(1)
})


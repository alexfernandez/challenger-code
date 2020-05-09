const {ApiError} = require('./model/error.js')
const {findChallenge} = require('./model/challenge.js')


async function runChallenge(options) {
	const challenge = await findChallenge(options.id)
	return await challenge.runSandboxed(options.code)
}

module.exports = {runChallenge}


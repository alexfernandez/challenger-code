const {findChallenge} = require('./model/challenge.js')


async function runChallenge(options) {
	const challenge = await findChallenge(options.id)
	const run = await challenge.runSandboxed(options.code)
	process.send(run)
}

module.exports = {runChallenge}


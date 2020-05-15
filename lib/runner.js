const {findChallenge} = require('./challenge.js')


async function runChallenge(options) {
	const challenge = await findChallenge(options.id)
	const run = await challenge.runSandboxed(options.code)
	if (process.send) process.send(run)
	else console.log(run)
}

module.exports = {runChallenge}


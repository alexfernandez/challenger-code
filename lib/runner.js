const {findChallenge} = require('./challenge/db.js')
const {Solution} = require('./challenge/solution.js')


async function runChallenge(options) {
	const challenge = await findChallenge(options.owner, options.challengeId)
	const solution = new Solution(challenge, options.code, options.sender)
	const run = await solution.runSandboxed()
	if (process.send) process.send(run)
	else console.log(run)
}

module.exports = {runChallenge}


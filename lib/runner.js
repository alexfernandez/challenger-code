const {findChallenge} = require('./challenge/main.js')
const {Solution} = require('./challenge/solution.js')


async function runChallenge(options) {
	const challenge = await findChallenge(options.id)
	const solution = new Solution(challenge, options.code, options.username)
	const run = await solution.runSandboxed()
	if (process.send) process.send(run)
	else console.log(run)
}

module.exports = {runChallenge}


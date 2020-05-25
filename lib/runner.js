const {findChallenge} = require('./challenge/db.js')
const {Solution} = require('./challenge/solution.js')


async function runChallenge(options) {
	if (!options.id.includes('/')) throw new Error('Invalid challenge id, needs path')
	const [username, id] = options.id.split('/', 1)
	const challenge = await findChallenge(username, id)
	const solution = new Solution(challenge, options.code, options.username)
	const run = await solution.runSandboxed()
	if (process.send) process.send(run)
	else console.log(run)
}

module.exports = {runChallenge}


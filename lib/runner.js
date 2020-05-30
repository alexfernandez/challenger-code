const {findChallenge} = require('./challenge/db.js')
const {Solution} = require('./challenge/solution.js')
const db = require('./db')


async function runChallenge(options) {
	await db.start(options.mongodb)
	try {
		const challenge = await findChallenge(options.owner, options.id)
		const solution = new Solution(challenge, options.code, options.sender)
		const run = await solution.runSandboxed()
		if (process.send) process.send(run)
		else console.log(run)
	} finally {
		await db.stop()
	}
}

module.exports = {runChallenge}


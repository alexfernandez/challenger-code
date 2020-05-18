const stdio = require('stdio')
const db = require('../lib/db.js')
const {makeAdmin} = require('../lib/user.js')

const options = stdio.getopt({
	email: {key: 'e', args: 1, description: 'Admin email'},
	mongodb: {key: 'm', description: 'MongoDB connection string', default: 'mongodb://localhost/cc'},
})

run()
	.then(() => console.log(`Made user ${options.email} an admin`))
	.catch(error => console.error(`Could not make admin user: ${error.stack}`))

async function run() {
	await db.start(options.mongodb)
	try {
		await makeAdmin(options.email)
	} finally {
		await db.stop()
	}
}


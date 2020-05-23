const {MongoClient} = require('mongodb')
const {useClient, createIndex} = require('./db.js')

let client = null

async function start(url = 'mongodb://localhost/test') {
	client = new MongoClient(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	await client.connect()
	useClient(client)
}

async function stop() {
	await client.close()
}

async function createIndexes() {
	await createIndex('users', 'username', {unique: true})
	await createIndex('users', 'email', {unique: true})
	await createIndex('auth', 'token', {unique: true})
}

module.exports = {
	start, stop, createIndexes,
}


const {MongoClient} = require('mongodb')

let client = null

async function start(url = 'mongodb://localhost/test') {
	client = new MongoClient(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	await client.connect()
}

async function stop() {
	await client.close()
}

async function store(collection, data) {
	await client.db().collection(collection).insertOne(data)
}

module.exports = {start, stop, store}


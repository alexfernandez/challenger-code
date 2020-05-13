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

async function createIndex(collection, field) {
	getCollection(collection).createIndex({[field]: "hashed"})
}

async function insert(collection, data) {
	await getCollection(collection).insertOne({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	})
}

async function update(collection, _id, data) {
	await getCollection(collection).updateOne({_id}, {
		...data,
		updatedAt: new Date(),
	})
}

async function read(collection, data) {
	return await getCollection(collection).findOne(data)
}

function getCollection(name) {
	return client.db().collection(name)
}

module.exports = {
	start, stop, createIndex,
	insert, update, read,
}


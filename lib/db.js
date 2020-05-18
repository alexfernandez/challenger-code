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

async function createIndex(collection, field, options) {
	await getCollection(collection).createIndex({[field]: 1}, options)
}

async function insert(collection, data) {
	const {insertedId} = await getCollection(collection).insertOne({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	})
	data._id = insertedId
}

async function update(collection, _id, data) {
	await getCollection(collection).updateOne({_id}, {$set: {
		...data,
		updatedAt: new Date(),
	}})
}

async function read(collection, data) {
	return await getCollection(collection).findOne(data)
}

async function remove(collection, data) {
	return await getCollection(collection).deleteOne(data)
}

async function removeAll(collection, data) {
	return await getCollection(collection).deleteMany(data)
}

function getCollection(name) {
	return client.db().collection(name)
}

module.exports = {
	start, stop, createIndex,
	insert, update, read, remove, removeAll,
}


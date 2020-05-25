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

async function createIndexes() {
	await getCollection('users').createIndex({username: 1}, {unique: true})
	await getCollection('users').createIndex({email: 1}, {unique: true})
	await getCollection('auth').createIndex({token: 1}, {unique: true})
	await getCollection('challenges').createIndex({owner: 1, id: 1}, {unique: true})
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

async function list(collection, data) {
	return await getCollection(collection).find(data).toArray()
}

async function read(collection, data) {
	return await getCollection(collection).findOne(data)
}

async function stats(collection, data, fields) {
	const group = {_id: null}
	for (const field of fields) {
		group[`${field}Min`] = {$min: `$${field}`}
		group[`${field}Avg`] = {$avg: `$${field}`}
	}
	const pipeline = [{$match: data}, {$group: group}]
	const stats = await getCollection(collection).aggregate(pipeline).toArray()
	return stats[0]
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
	start, stop, createIndexes,
	insert, update, read, list, stats,
	remove, removeAll,
}


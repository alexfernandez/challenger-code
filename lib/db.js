const {MongoClient} = require('mongodb')

let client = null
let mongoUrl = null

async function start(url = 'mongodb://localhost/test') {
	mongoUrl = url
	client = new MongoClient(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	await client.connect()
	await getCollection('users').createIndex({username: 1}, {unique: true})
	await getCollection('users').createIndex({email: 1}, {unique: true})
	await getCollection('challenges').createIndex({owner: 1, id: 1}, {unique: true})
}

async function stop() {
	await client.close()
}

function getUrl() {
	return mongoUrl
}

async function insert(collection, data) {
	const {insertedId} = await getCollection(collection).insertOne({
		...data,
		createdAt: new Date(),
		updatedAt: new Date(),
	})
	data._id = insertedId
}

async function update(collection, data, search = {_id: data._id}) {
	const updater = {}
	for (const key in data) {
		const value = data[key]
		if (value !== null && value !== undefined) {
			updater[key] = value
		}
	}
	await getCollection(collection).updateOne(search, {$set: {
		...updater,
		updatedAt: new Date(),
	}})
}

async function list(collection, data) {
	return await getCollection(collection).find(data).toArray()
}

async function listGrouped(collection, data, field) {
	const pipeline = [{$match: data}, {$group: {_id: `$${field}`, array: {$push: '$$ROOT'}}}]
	const groups = await getCollection(collection).aggregate(pipeline).toArray()
	const result = {}
	for (const group of groups) {
		const key = group._id
		result[key] = group.array
	}
	return result
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
	start, stop, getUrl,
	insert, update, read, list, listGrouped,
	stats, remove, removeAll,
}



let client = null

function useClient(dbClient) {
	client = dbClient
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

async function stats(collection, data, fields) {
	const group = {_id: null}
	for (const field of fields) {
		group[`${field}Min`] = {$min: `$${field}`}
		group[`${field}Avg`] = {$avg: `$${field}`}
	}
	const pipeline = [{$match: data}, {$group: group}]
	return await getCollection(collection).aggregate(pipeline).toArray()
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
	useClient, createIndex,
	insert, update, read, stats,
	remove, removeAll,
}


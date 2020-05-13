const crypto = require('crypto');

function createTestToken() {
	const bytes = crypto.pseudoRandomBytes(8);
	return bytes.readUInt32LE().toString(36)
}

/**
 * Adapted from https://stackoverflow.com/questions/8855687/secure-random-token-in-node-js
 */
function createSecureToken(byteLength = 20) {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(byteLength, (err, buffer) => {
			if (err) {
				reject(err)
			} else {
				resolve(buffer.toString('base64'))
			}
		})
	})
}

module.exports = {createTestToken, createSecureToken}


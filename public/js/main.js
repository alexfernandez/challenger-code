'use strict'


window.onload = () => {
	for (const loader of window.loaders) {
		loader()
	}
	console.log('loaded')
}

window.loaders = [() => {
	const json = localStorage.getItem('ccAuth')
	if (json) {
		try {
			window.ccAuth = JSON.parse(json)
			if (window.ccAuth && window.ccAuth.username) {
				document.getElementById('register').className = 'invisible'
				const current = document.getElementById('currentUsername')
				current.innerText = window.ccAuth.username
				current.href = `/${window.ccAuth.username}`
				document.getElementById('loggedin').className = ''
			}
		} catch(error) {
			console.error(error)
		}
	}
}]

window.processAuth = function(action, url, body) {
	console.log('sending')
	fetchAndStoreAuth(action, url, body).catch(error => window.showAuthError(action, error))
}

async function fetchAndStoreAuth(action, url, body) {
	document.getElementById('send').disabled = true
	document.getElementById('result').className = ''
	document.getElementById('result').innerHTML = '<img class="loader" src="/img/loader.gif" />'
	const response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	})
	const json = await response.json()
	document.getElementById('result').innerText = ''
	if (response.status != 200) {
		throw new Error(json.error)
	}
	await window.storeAuth(json)
}

window.storeAuth = async function(auth) {
	localStorage.setItem('ccAuth', JSON.stringify(auth))
	const previousLocation = localStorage.getItem('ccLocation')
	localStorage.removeItem('ccLocation')
	window.location = previousLocation || '/'
}

window.showAuthError = function(action, error) {
	document.getElementById('send').disabled = false
	document.getElementById('result').className = 'errored'
	document.getElementById('result').innerText = `Could not ${action}: ${error}`
}


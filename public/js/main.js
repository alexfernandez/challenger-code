'use strict'


window.onload = () => {
	for (const loader of window.loaders) {
		loader()
	}
	console.log('loaded')
}

window.loaders = [() => {
	const json = localStorage.getItem('ccUser')
	if (json) {
		try {
			window.ccUser = JSON.parse(json)
			if (window.ccUser && window.ccUser.username) {
				document.getElementById('register').className = 'invisible'
				const current = document.getElementById('currentUsername')
				current.innerText = window.ccUser.username
				current.href = `/${window.ccUser.username}`
				document.getElementById('loggedin').className = ''
			}
		} catch(error) {
			console.error(error)
		}
	}
}]

window.processUser = function(action, url, body) {
	console.log('sending')
	fetchAndStoreUser(action, url, body).catch(error => window.showUserError(action, error))
}

async function fetchAndStoreUser(action, url, body) {
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
	await window.storeUser(json)
}

window.storeUser = async function(user) {
	localStorage.setItem('ccUser', JSON.stringify(user))
	const previousLocation = localStorage.getItem('ccLocation')
	localStorage.removeItem('ccLocation')
	window.location = previousLocation || '/'
}

window.showUserError = function(action, error) {
	document.getElementById('send').disabled = false
	document.getElementById('result').className = 'errored'
	document.getElementById('result').innerText = `Could not ${action}: ${error}`
}

window.sendToLogin = function() {
	localStorage.setItem('ccLocation', window.location)
	window.location = '/user/login'
}


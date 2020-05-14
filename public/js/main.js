'use strict'


window.onload = () => {
	for (const loader of window.loaders) {
		loader()
	}
	console.log('loaded')
}

window.loaders = [() => {
	const json = localStorage.getItem('ccAuth')
	console.log(json)
	if (json) {
		try {
			window.ccAuth = JSON.parse(json)
			if (window.ccAuth && window.ccAuth.email) {
				document.getElementById('register').className = 'invisible'
				document.getElementById('useremail').innerText = window.ccAuth.email
				document.getElementById('loggedin').className = ''
			}
		} catch(error) {
			console.error(error)
		}
	}
}]

window.processAuth = function(action, fetcher) {
	fetchAndStore(action, fetcher).catch(error => window.showError(action, error))
}

async function fetchAndStore(action, fetcher) {
	const response = await fetcher()
	await storeAuth(action, response)
}

async function storeAuth(action, response) {
	const json = await response.json()
	if (response.status != 200) {
		return window.showError(action, json.error)
	}
	document.getElementById('error').className = 'invisible'
	document.getElementById('error').className = 'invisible'
	localStorage.setItem('ccAuth', JSON.stringify(json))
	window.location = '/'
}

window.showError = function(action, error) {
	document.getElementById('send').disabled = false
	document.getElementById('error').className = 'errored'
	document.getElementById('error').innerText = `Could not ${action}: ${error}`
}


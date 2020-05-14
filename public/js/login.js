'use strict'

window.onload = () => {
	console.log('loaded')
	const send = document.getElementById('send')
	send.onclick = sendLogin
}

function sendLogin() {
	console.log('sending')
	document.getElementById('send').disabled = true
	const email = document.getElementById('email').value
	const password = document.getElementById('password').value
	const body = {email, password}
	fetch(`/api/login`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	}).then(storeResponse).catch(showError)
}

function storeResponse(response) {
	if (response.status != 200) {
		response.json().then(json => {
			document.getElementById('send').disabled = false
			document.getElementById('error').className = 'errored'
			console.log(json)
			document.getElementById('error').innerText = `Could not login: ${json.error}`
		})
		return
	}
	document.getElementById('error').className = 'invisible'
	response.json().then(json => {
		console.log(`Result: ${JSON.stringify(json)}`)
		document.getElementById('error').className = 'invisible'
		localStorage.setItem(json, json)
	})
}

function showError(error) {
	document.getElementById('send').disabled = false
	document.getElementById('error').className = 'errored'
	document.getElementById('error').innerText = `Could not login: ${error}`
}


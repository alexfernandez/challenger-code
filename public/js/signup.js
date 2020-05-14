'use strict'


window.loaders.push(() => {
	const send = document.getElementById('send')
	send.onclick = sendSignup
})

function sendSignup() {
	const password = document.getElementById('password').value
	const confirmPassword = document.getElementById('confirmPassword').value
	if (!password || password != confirmPassword) {
		return showError('Passwords do not match')
	}
	console.log('sending')
	document.getElementById('send').disabled = true
	const email = document.getElementById('email').value
	const body = {email, password, confirmPassword}
	fetch(`/api/signup`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	}).then(storeResponse).catch(showError)
}

function storeResponse(response) {
	if (response.status != 200) {
		response.json().then(json => {
			showError(json.error)
		})
		return
	}
	document.getElementById('error').className = 'invisible'
	response.json().then(json => {
		document.getElementById('error').className = 'invisible'
		localStorage.setItem('token', json)
		window.location = '/'
	})
}

function showError(error) {
	document.getElementById('send').disabled = false
	document.getElementById('error').className = 'errored'
	document.getElementById('error').innerText = `Could not sign up: ${error}`
}


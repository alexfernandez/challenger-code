'use strict'


window.loaders.push(() => {
	const send = document.getElementById('send')
	send.onclick = sendSignup
})

function sendSignup() {
	const password = document.getElementById('password').value
	const confirmPassword = document.getElementById('confirmPassword').value
	if (!password || password != confirmPassword) {
		return window.showError('signup', 'Passwords do not match')
	}
	console.log('sending')
	document.getElementById('send').disabled = true
	const email = document.getElementById('email').value
	const body = {email, password, confirmPassword}
	window.processAuth('signup', () => fetch(`/api/signup`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	}))
}


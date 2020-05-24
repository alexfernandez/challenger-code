'use strict'


window.loaders.push(() => {
	const send = document.getElementById('send')
	send.onclick = sendLogin
})

function sendLogin() {
	console.log('sending')
	document.getElementById('send').disabled = true
	const email = document.getElementById('email').value
	const password = document.getElementById('password').value
	const body = {email, password}
	window.processAuth('login', () => fetch(`/api/user/login`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	}))
}


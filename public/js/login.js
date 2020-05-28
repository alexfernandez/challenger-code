'use strict'


window.loaders.push(() => {
	const send = document.getElementById('send')
	send.onclick = sendLogin
})

function sendLogin() {
	const email = document.getElementById('email').value
	const password = document.getElementById('password').value
	const body = {email, password}
	window.processUser('login', `/api/user/login`, body)
}


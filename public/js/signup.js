'use strict'


window.loaders.push(() => {
	const send = document.getElementById('send')
	send.onclick = sendSignup
})

function sendSignup() {
	const password = document.getElementById('password').value
	const confirmPassword = document.getElementById('confirmPassword').value
	if (!password || password != confirmPassword) {
		return window.showAuthError('signup', 'Passwords do not match')
	}
	const username = document.getElementById('username').value
	const email = document.getElementById('email').value
	const body = {username, email, password, confirmPassword}
	window.processAuth('signup', `/api/user/signup`, body)
}


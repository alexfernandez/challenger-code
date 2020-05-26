'use strict'


window.loaders.push(() => {
	const username = document.getElementById('username').innerText
	if  (window.ccAuth && window.ccAuth.username == username) {
		document.getElementById('personal').className = ''
	}
	const logout = document.getElementById('logout')
	if (!logout) return
	logout.onclick = () => {
		localStorage.removeItem('ccAuth')
		window.location = '/'
	}
})


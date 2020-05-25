'use strict'


window.loaders.push(() => {
	const logout = document.getElementById('logout')
	if (!logout) return
	logout.onclick = () => {
		localStorage.removeItem('ccAuth')
		window.location = '/'
	}
})


'use strict'


window.loaders.push(() => {
	console.log('hi')
	if (!window.ccAuth) {
		window.location = '/'
		return
	}
	document.getElementById('logout').onclick = () => {
		localStorage.removeItem('ccAuth')
		window.location = '/'
	}
})


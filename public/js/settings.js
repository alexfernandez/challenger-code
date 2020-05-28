'use strict'


window.loaders.push(() => {
	console.log('hi')
	if (!window.ccUser) {
		window.location = '/'
		return
	}
	document.getElementById('logout').onclick = () => {
		localStorage.removeItem('ccUser')
		window.location = '/'
	}
})


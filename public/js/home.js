'use strict'

window.loaders.push(() => {
	if (window.ccUser && window.ccUser.role == 'admin') {
		document.getElementById('create').className = ''
	}
})


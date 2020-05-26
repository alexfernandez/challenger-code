'use strict'

window.loaders.push(() => {
	if (window.ccAuth && window.ccAuth.role == 'admin') {
		document.getElementById('create').className = ''
	}
})


'use strict'

window.loaders.push(() => {
	const owner = document.getElementById('owner').innerText
	if (window.ccAuth && window.ccAuth.username == owner) {
		document.getElementById('edit').className = ''
	}
})


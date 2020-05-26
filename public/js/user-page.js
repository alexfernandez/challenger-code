'use strict'


window.loaders.push(() => {
	const username = document.getElementById('username').innerText
	if  (window.ccAuth && window.ccAuth.username == username) {
		document.getElementById('personal').className = ''
		document.getElementById('create').className = ''
		const edits = document.getElementsByClassName('edit')
		for (const edit of edits) {
			edit.className = 'edit'
		}
	}
	document.getElementById('logout').onclick = () => {
		localStorage.removeItem('ccAuth')
		window.location = '/'
	}
})


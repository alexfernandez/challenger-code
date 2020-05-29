'use strict'

window.loaders.push(() => {
	if (window.ccUser && window.ccUser.role == 'admin') {
		document.getElementById('create').className = ''
		const edits = document.getElementsByClassName('edit')
		for (const edit of edits) {
			edit.classList.remove('invisible')
		}
	}
})


'use strict'

window.loaders.push(() => {
	const owner = document.getElementById('owner').innerText
	if (window.ccUser && window.ccUser.username == owner) {
		document.getElementById('edit').className = ''
		document.getElementById('delete').className = ''
		const deletion = new window.Deletion({
			owner,
			id: document.getElementById('id').innerText,
			button: document.getElementById('delete'),
			name: document.getElementById('name').innerText,
			result: document.getElementById('result'),
			success: () => history.back(),
		})
		deletion.setup()
	}
})


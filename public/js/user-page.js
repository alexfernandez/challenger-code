'use strict'


window.loaders.push(() => {
	const username = document.getElementById('username').innerText
	if  (window.ccUser && window.ccUser.username == username) {
		document.getElementById('personal').className = ''
		document.getElementById('create').className = ''
		processClass('edit', makeVisible)
		processClass('delete', makeVisible)
		processClass('delete', button => {
			const id = button.id.slice(button.id.indexOf('-') + 1)
			const deletion = new window.Deletion({
				owner: username,
				id,
				button,
				name: document.getElementById(`name-${id}`).innerText,
				result: document.getElementById(`result-${id}`),
				success: () => window.location.reload(),
			})
			deletion.setup()
		})
	}
	document.getElementById('logout').onclick = () => {
		localStorage.removeItem('ccUser')
		window.location = '/'
	}
})

function processClass(className, operation) {
	const elements = document.getElementsByClassName(className)
	for (const element of elements) {
		operation(element)
	}
}

function makeVisible(element) {
	element.classList.remove('invisible')
}


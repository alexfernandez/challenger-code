'use strict'


window.loaders.push(() => {
	const username = document.getElementById('username').innerText
	if  (window.ccAuth && window.ccAuth.username == username) {
		document.getElementById('personal').className = ''
		document.getElementById('create').className = ''
		processClass('edit', makeVisible)
		processClass('delete', makeVisible)
		processClass('delete', element => element.onclick = () => {
			const id = element.id.slice(element.id.indexOf('-') + 1)
			deleteChallenge(username, id).catch(error => showError(error, id))
		})
	}
	document.getElementById('logout').onclick = () => {
		localStorage.removeItem('ccAuth')
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

async function deleteChallenge(username, id) {
	const element = document.getElementById(`result-${id}`)
	element.className = ''
	element.innerText = ''
	const name = document.getElementById(`name-${id}`).innerText
	const sure = confirm(`Are you sure you want to delete challenge ${name}?`)
	if (!sure) return
	const response = await fetch(`/api/challenge/${username}/${id}`, {
		method: 'DELETE',
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
	})
	if (response.status != 204) {
		const json = await response.json()
		showError(json.error, id)
		return
	}
	element.className = 'success'
	element.innerText = '✅ Challenge deleted'
	setTimeout(() => window.location.reload(), 2000)
}

function showError(error, id) {
	const element = document.getElementById(`result-${id}`)
	element.className = 'errored'
	element.innerText = `❌ Could not delete: ${error}`
}


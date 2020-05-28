'use strict'

window.loaders.push(() => {
	loadChallenge().catch(window.showError)
})

async function loadChallenge() {
	document.getElementById('save').disabled = true
	if (!window.ccUser) {
		return window.sendToLogin()
	}
	const owner = document.getElementById('owner').innerText
	const id = document.getElementById('id').value
	const challenge = await window.apiFetch('edit', `${owner}/${id}/edit`, 'GET')
	for (const attribute in challenge) {
		const element = document.getElementById(attribute)
		if (element) element.value = challenge[attribute]
	}
	for (const verification of challenge.verifications) {
		window.addVerification(verification)
	}
	document.getElementById('save').disabled = false
}


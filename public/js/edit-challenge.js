'use strict'

window.loaders.push(() => {
	loadChallenge().catch(console.error)
})

async function loadChallenge() {
	document.getElementById('save').disabled = true
	if (!window.ccAuth) {
		return
	}
	const owner = document.getElementById('owner').innerText
	const id = document.getElementById('id').value
	const response = await fetch(`/api/challenge/${owner}/${id}/edit`, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
	})
	const challenge = await response.json()
	if (response.status != 200) {
		window.showError(challenge.error)
		return
	}
	for (const attribute in challenge) {
		const element = document.getElementById(attribute)
		if (element) element.value = challenge[attribute]
	}
	for (const verification of challenge.verifications) {
		window.addVerification(verification)
	}
	document.getElementById('save').disabled = false
}


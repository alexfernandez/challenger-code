'use strict'

window.loaders.push(() => {
	loadChallenge().catch(console.error)
})

async function loadChallenge() {
	if (!window.ccAuth) {
		return
	}
	document.getElementById('save').disabled = true
	const owner = document.getElementById('owner').innerText
	const id = document.getElementById('id').value
	const response = await fetch(`/api/challenge/${owner}/${id}/edit`, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
	})
	if (response.status != 200) {
		response.json().then(json => {
			window.showError(json.error)
		})
		return
	}
	const challenge = await response.json()
	for (const attribute in challenge) {
		const element = document.getElementById(attribute)
		if (element) element.value = challenge[attribute]
	}
	for (const verification of challenge.verifications) {
		window.addVerification(verification)
	}
	document.getElementById('save').disabled = false
}


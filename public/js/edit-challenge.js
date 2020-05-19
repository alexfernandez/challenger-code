'use strict'

let codeMirror = null
const fields = [
	'id', 'name', 'description', 'difficulty', 'category',
	'runningTimeoutSeconds', 'maxMinutes', 'implementation',
]

window.loaders.push(() => {
	loadPage().catch(console.error)
})

async function loadPage() {
	await loadChallenge()
	codeMirror = CodeMirror.fromTextArea(document.getElementById('implementation'), {
		mode:  'javascript',
		indentUnit: 4,
		indentWithTabs: true,
		lineWrapping: true,
		lineNumbers: true,
		autofocus: true,
		cursorBlinkRate: 0,
	})
	document.getElementById('save').onclick = saveChallenge
	document.getElementById('add-verification').onclick = addVerification
	if (!countVerifications()) addVerification()
}

function addVerification(data = {}) {
	const verification = document.getElementById('verification').cloneNode(true)
	verification.id = ''
	verification.className = ''
	if (data.input) {
		const input = verification.children[0]
		const rawInput = JSON.stringify(data.input)
		input.value = rawInput.substring(1, rawInput.length - 1)
	}
	if (data.output) {
		const output = verification.children[1]
		output.value = data.output
	}
	const remove = verification.children[2]
	remove.onclick = removeVerification
	document.getElementById('verifications').appendChild(verification)
	disableIfLastVerification()
}

function countVerifications() {
	return document.getElementById('verifications').children.length
}

function removeVerification(event) {
	const remove = event.srcElement
	const verification = remove.parentElement
	document.getElementById(`verifications`).removeChild(verification)
	disableIfLastVerification()

}

function disableIfLastVerification() {
	const total = countVerifications()
	const first = document.getElementById(`verifications`).children[0]
	const remove = first.children[2]
	if (total == 1) {
		remove.disabled = true
	} else {
		remove.disabled = false
	}
}

async function loadChallenge() {
	if (!window.ccAuth) {
		return
	}
	document.getElementById('save').disabled = true
	const id = document.getElementById('id').value
	if (!id) return
	const response = await fetch(`/api/challenge/main/${id}/edit`, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
	})
	if (response.status != 200) {
		response.json().then(json => {
			showError(json.error)
		})
		return
	}
	const challenge = await response.json()
	for (const attribute in challenge) {
		const element = document.getElementById(attribute)
		if (element) setAttribute(element, challenge[attribute])
	}
	for (const verification of challenge.verifications) {
		addVerification(verification)
	}
	document.getElementById('save').disabled = false
}

function setAttribute(element, attribute) {
	element.value = attribute
}

function saveChallenge() {
	if (!window.ccAuth) {
		return
	}
	codeMirror.save()
	console.log('saving')
	document.getElementById('save').disabled = true
	const body = buildBody()
	fetch(`/api/challenge/main/${body.id}/save`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
	}).then(showResponse).catch(showError)
}

function buildBody() {
	const body = {username: 'main', verifications: readVerifications()}
	fields.forEach(field => body[field] = document.getElementById(field).value)
	return body
}

function readVerifications() {
	const verifications = []
	const parent = document.getElementById(`verifications`)
	for (const child of parent.children) {
		const input = child.children[0].value
		const output = child.children[1].value
		verifications.push({input, output})
	}
	return verifications
}

function showResponse(response) {
	document.getElementById('save').disabled = false
	document.getElementById('result').className = 'disabled'
	if (response.status != 200) {
		response.json().then(json => {
			showError(json.error)
		})
		return
	}
	response.json().then(json => {
		console.log(`Result: ${JSON.stringify(json)}`)
		document.getElementById('result').className = 'success'
		document.getElementById('result').innerText = '✅ Challenge saved'
	})
}

function showError(error) {
	document.getElementById('save').disabled = false
	document.getElementById('result').className = 'errored'
	document.getElementById('result').innerText = `❌ Could not save: ${error}`
}


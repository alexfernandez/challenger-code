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
	if (!document.getElementById('verification0')) addVerification()
}

function addVerification(data) {
	const order = countVerifications()
	console.log(`adding ${order}`)
	const verification = document.getElementById('verification').cloneNode(true)
	verification.id = `verification${order}`
	verification.className = ''
	const rawInput = JSON.stringify(data.input)
	for (const child of verification.children) {
		console.log(child.id)
		if (child.id == 'remove') child.onclick = removeVerification
		else if (child.id == 'input') child.value = rawInput.substring(1, rawInput.length - 1)
		else if (child.id == 'output') child.value = data.output
		child.id += order
	}
	document.getElementById('verifications').appendChild(verification)
	disableIfLastVerification()
}

function countVerifications() {
	for (let i = 0; i < 20; i++) {
		const field = document.getElementById(`verification${i}`)
		if (!field) return i
	}
	return 20
}

function removeVerification(event) {
	console.log(event)
	const id = event.srcElement.id
	const order = parseInt(id.replace('remove', ''))
	console.log(order)
	const verification = document.getElementById(`verification${order}`)
	document.getElementById(`verifications`).removeChild(verification)
	disableIfLastVerification()

}

function disableIfLastVerification() {
	const total = countVerifications()
	if (total == 1) {
		document.getElementById(`remove0`).disabled = true
	} else {
		document.getElementById(`remove0`).disabled = false
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
	console.log(challenge)
	for (const verification of challenge.verifications) {
		addVerification(verification)
	}
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
	for (let i = 0; i < 20; i++) {
		const field = document.getElementById(`verification${i}`)
		if (!field) return verifications
		verifications[i] = {
			input: document.getElementById(`input${i}`).value,
			output: document.getElementById(`output${i}`).value,
		}
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


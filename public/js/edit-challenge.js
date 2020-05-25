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
	verification.className = 'verification'
	for (const child of verification.children) {
		if (child.name == 'remove') {
			child.onclick = removeVerification
		} else {
			setVerificationValue(data[child.name], child)
		}
	}
	document.getElementById('verifications').appendChild(verification)
	disableIfLastVerification()
}

function setVerificationValue(value, element) {
	if (value === undefined) return
	if (element.type == 'checkbox') {
		element.checked = value
		return
	}
	if (element.name == 'input') {
		element.value = JSON.stringify(value).slice(1, -1)
		return
	}
	element.value = value
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
			showError(json.error)
		})
		return
	}
	const challenge = await response.json()
	for (const attribute in challenge) {
		const element = document.getElementById(attribute)
		if (element) element.value = challenge[attribute]
	}
	for (const verification of challenge.verifications) {
		addVerification(verification)
	}
	document.getElementById('save').disabled = false
}

function saveChallenge() {
	if (!window.ccAuth) {
		return
	}
	codeMirror.save()
	console.log('saving')
	document.getElementById('save').disabled = true
	const body = buildBody()
	fetch(`/api/challenge/${body.owner}/${body.id}/save`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
	}).then(showResponse).catch(showError)
}

function buildBody() {
	const owner = document.getElementById('owner').innerText
	const body = {owner, verifications: readVerifications()}
	fields.forEach(field => {
		body[field] = document.getElementById(field).value
	})
	return body
}

function readVerifications() {
	const verifications = []
	const parent = document.getElementById(`verifications`)
	for (const child of parent.children) {
		verifications.push(readVerification(child))
	}
	return verifications
}

function readVerification(element) {
	const verification = {}
	for (const child of element.children) {
		if (child.name) {
			verification[child.name] = getVerificationField(child)
		}
	}
	return verification
}

function getVerificationField(element) {
	if (element.type == 'checkbox') return element.checked
	if (element.name == 'input') return JSON.parse(`[${element.value}]`)
	if (element.name == 'output') return parseFloat(element.value)
	if (element.name == 'remove') return undefined
	return element.value
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
		document.getElementById('result').className = 'success'
		document.getElementById('result').innerText = '✅ Challenge saved'
	})
}

function showError(error) {
	document.getElementById('save').disabled = false
	document.getElementById('result').className = 'errored'
	document.getElementById('result').innerText = `❌ Could not save: ${error}`
}


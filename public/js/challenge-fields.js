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
	document.getElementById('add-verification').onclick = () => addVerification()
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

function saveChallenge() {
	if (!window.ccAuth) {
		return
	}
	codeMirror.save()
	console.log('saving')
	startFetch()
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
	stopFetch()
	if (response.status != 200) {
		response.json().then(json => {
			showError(json.error)
		})
		return
	}
	response.json().then(() => {
		document.getElementById('result').className = 'success'
		document.getElementById('result').innerText = '✅ Challenge saved'
		setTimeout(() => {
			document.getElementById('result').className = ''
			document.getElementById('result').innerText = ''
		}, 5000)
	})
}

function showError(error) {
	stopFetch()
	document.getElementById('result').className = 'errored'
	document.getElementById('result').innerText = `❌ Could not save: ${error}`
}

function startFetch() {
	document.getElementById('save').disabled = true
	document.getElementById('result').innerText = ''
	document.getElementById('result').className = ''
	document.getElementById('loader').innerHTML = '<img class="loader" src="/img/loader.gif" />'
}

function stopFetch() {
	document.getElementById('save').disabled = false
	document.getElementById('result').className = 'disabled'
	document.getElementById('loader').innerHTML = ''
}


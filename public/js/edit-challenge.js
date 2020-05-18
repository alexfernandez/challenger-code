'use strict'

let codeMirror = null
const fields = [
	'id', 'name', 'description', 'difficulty', 'category',
	'runningTimeoutSeconds', 'maxMinutes', 'implementation',
]

window.loaders.push(() => {
	codeMirror = CodeMirror.fromTextArea(document.getElementById('implementation'), {
		mode:  'javascript',
		indentUnit: 4,
		indentWithTabs: true,
		lineWrapping: true,
		lineNumbers: true,
		autofocus: true,
		cursorBlinkRate: 0,
	})
	document.getElementById('save').onclick = saveDocument
	document.getElementById('add-verification').onclick = addVerification
	if (!document.getElementById('verification0')) addVerification()
})

function addVerification() {
	const order = countVerifications()
	console.log(`adding ${order}`)
	const verification = document.getElementById('verification').cloneNode(true)
	verification.id = `verification${order}`
	verification.className = ''
	for (const child of verification.children) {
		if (child.id == 'remove') child.onclick = removeVerification
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

function saveDocument() {
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
	const body = {verifications: readVerifications()}
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

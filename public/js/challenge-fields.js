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
	document.getElementById('add-verification').onclick = () => addVerification()
	const saving = new window.Saving({
		codeMirror,
		button: document.getElementById('save'),
		buildBody,
		result: document.getElementById('result'),
	})
	saving.setup()
}

function addVerification(data = {}) {
	const verification = document.getElementById('verification').cloneNode(true)
	verification.id = ''
	verification.className = 'verification'
	const byName = {}
	for (const child of verification.children) {
		byName[child.name] = child
	}
	byName.remove.onclick = removeVerification
	byName.public.checked = data.public
	byName.name.value = data.name
	if (data.input) byName.input.value = JSON.stringify(data.input).slice(1, -1)
	byName.output.value = data.output
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

function buildBody() {
	const owner = document.getElementById('owner').innerText
	const body = {owner, verifications: readVerifications()}
	fields.forEach(field => {
		const element = document.getElementById(field)
		if (!element.value) {
			element.parentElement.className = 'errored'
			throw new Error(`${field} cannot be empty`)
		}
		element.parentElement.className = ''
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
			const value = getVerificationField(child)
			if (isInvalid(child.name, value)) {
				child.className = 'errored'
				throw new Error(`${child.name} cannot be empty`)
			}
			child.className = ''
			verification[child.name] = getVerificationField(child)
		}
	}
	return verification
}

function isInvalid(name, value) {
	if (name == 'public') return false
	if (typeof value == 'string' && value === '') return true
	if (typeof value == 'number' && isNaN(value)) return true
	return false
}

function getVerificationField(element) {
	if (element.type == 'checkbox') return element.checked
	if (element.name == 'input') return JSON.parse(`[${element.value}]`)
	if (element.name == 'output') return parseFloat(element.value)
	if (element.name == 'remove') return undefined
	return element.value
}


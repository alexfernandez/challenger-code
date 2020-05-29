'use strict'

let codeMirror = null
const fields = [
	'id', 'name', 'description', 'difficulty', 'category',
	'runningTimeoutSeconds', 'maxMinutes', 'implementation',
]
const codeMirrorConfig = {
	mode:  'javascript',
	indentUnit: 4,
	indentWithTabs: true,
	lineWrapping: true,
	lineNumbers: true,
	autofocus: true,
	cursorBlinkRate: 0,
}

window.loaders.push(() => {
	loadPage().catch(console.error)
})

async function loadPage() {
	codeMirror = CodeMirror.fromTextArea(document.getElementById('implementation'), codeMirrorConfig)
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
	verification.classList.remove('invisible')
	const byName = sortByName(verification)
	byName.remove.onclick = removeVerification
	byName.public.checked = data.public
	byName.name.value = data.name
	const input = new Input(data)
	byName.input.value = input.string
	byName.output.value = data.output
	for (const name in input.variables) {
		const variable = document.getElementById('variable').cloneNode(true)
		variable.classList.remove('invisible')
		variable.id = ''
		variable.value = input.variables[name]
		verification.appendChild(variable)
		const editor = CodeMirror.fromTextArea(variable, {
			...codeMirrorConfig,
			lineNumbers: false,
		})
		const panel = document.getElementById('panel').cloneNode(true)
		panel.id = ''
		panel.classList.remove('invisible')
		panel.innerText = name
		editor.addPanel(panel, {
			position: top,
		})
	}
	document.getElementById('verifications').appendChild(verification)
	disableIfLastVerification()
}

function sortByName(parent) {
	const byName = {}
	for (const child of parent.children) {
		byName[child.name] = child
	}
	return byName
}

class Input {
	constructor(data) {
		this.data = data
		this.string = ''
		this.variables = {}
		this.build()
	}

	build() {
		if (!this.data.input) return
		console.log(this.data.input)
		const parameters = JSON.parse(`[${this.data.input}]`)
		const result = []
		for (const parameter of parameters) {
			const display = this.getDisplay(parameter)
			result.push(display)
		}
		this.string = result.join(',')
	}

	getDisplay(parameter) {
		if (typeof parameter != 'string') return JSON.stringify(parameter)
		// variable in backticks starting with a letter, then alphanumeric sequence
		const match = parameter.match(/^`(\p{L}[\p{L}|\p{N}]*)`$/u)
		if (!match) return JSON.stringify(parameter)
		console.log(match)
		const name = match[1]
		const value = this.data[name]
		this.variables[name] = value
		return name
	}
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


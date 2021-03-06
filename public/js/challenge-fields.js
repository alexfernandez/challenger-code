'use strict'

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
	viewportMargin: Infinity,
}

window.loaders.push(() => {
	loadPage().catch(console.error)
})
const variableEditors = []

async function loadPage() {
	const implementation = document.getElementById('implementation')
	window.codeMirror = CodeMirror.fromTextArea(implementation, codeMirrorConfig)
	document.getElementById('add-verification').onclick = () => addVerification()
	const saving = new window.Saving({
		codeMirror: window.codeMirror,
		button: document.getElementById('save'),
		buildBody,
		result: document.getElementById('result'),
	})
	saving.setup()
}

function addVerification(verification = {}) {
	const element = document.getElementById('verification').cloneNode(true)
	element.id = ''
	element.classList.remove('invisible')
	const byName = sortByName(element)
	byName.remove.onclick = removeVerification
	byName.public.checked = verification.public
	byName.name.value = verification.name || ''
	const input = new Input(verification, element)
	input.write(byName.input)
	byName.output.value = verification.output
	input.buildEditors()
	document.getElementById('verifications').appendChild(element)
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
	constructor(verification, element) {
		this.verification = verification
		this.element = element
		this.string = ''
		this.variables = new Map()
		this.editors = new Map()
		this.panels = new Map()
		this.timeout = null
		this.readParameters()
	}

	readParameters() {
		if (!this.verification.input) return
		const parameters = JSON.parse(`[${this.verification.input}]`)
		const result = []
		for (const parameter of parameters) {
			const display = this.getDisplay(parameter)
			result.push(display)
		}
		this.string = result.join(',')
	}

	getDisplay(parameter) {
		if (typeof parameter != 'string') return JSON.stringify(parameter)
		// variable in ${} starting with a letter, then alphanumeric sequence
		const matches = parameter.match(/^\$\{(\p{L}[\p{L}|\p{N}]*)\}$/u)
		if (!matches) return JSON.stringify(parameter)
		const name = matches[1]
		const value = this.verification[name]
		this.variables.set(name, value)
		return parameter
	}

	write(input) {
		console.log('writing')
		input.value = this.string
		input.onkeyup = () => {
			if (this.timeout) clearTimeout(this.timeout)
			this.timeout = setTimeout(() => this.refreshParameters(input.value), 1000)
		}
	}

	refreshParameters(input) {
		const matches = input.matchAll(/\$\{(\p{L}[\p{L}|\p{N}]*)\}/gu)
		const variables = [...matches].map(match => match[1])
		for (const name of variables) {
			if (!this.variables.has(name)) {
				console.log(`adding ${name}`)
				this.variables.set(name, `const ${name} = `)
			}
		}
		for (const [name] of this.variables.entries()) {
			if (!variables.includes(name)) {
				this.variables.delete(name)
			}
		}
		this.buildEditors()
	}

	buildEditors() {
		for (const [name, value] of this.variables.entries()) {
			if (!this.editors.has(name)) {
				this.buildEditor(name, value)
			}
		}
		for (const [name, editor] of this.editors.entries()) {
			if (!this.variables.has(name)) {
				this.removeEditor(name, editor)
			}
		}
	}

	buildEditor(name, value) {
		const panel = document.getElementById('panel').cloneNode(true)
		panel.id = ''
		panel.classList.remove('invisible')
		panel.innerText = name
		this.element.appendChild(panel)
		this.panels.set(name, panel)
		const variable = document.getElementById('variable').cloneNode(true)
		variable.classList.remove('invisible')
		variable.id = ''
		variable.name = `var-${name}`
		variable.value = value
		this.element.appendChild(variable)
		const editor = CodeMirror.fromTextArea(variable, {
			...codeMirrorConfig,
			autofocus: false,
			lineNumbers: false,
		})
		variableEditors.push(editor)
		this.editors.set(name, editor)
		setTimeout(() => editor.refresh(), 10)
	}

	removeEditor(name, editor) {
		console.log(`removing ${name}`)
		const textArea = editor.getTextArea()
		editor.toTextArea()
		textArea.parentElement.removeChild(textArea)
		this.editors.delete(name)
		const panel = this.panels.get(name)
		panel.parentElement.removeChild(panel)
		this.panels.delete(name)
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
	const byName = sortByName(element)
	const verification = {
		public: byName.public.checked,
		name: byName.name.value,
		input: byName.input.value,
		output: parseFloat(byName.output.value),
	}
	if (!verification.name) showVerificationError(byName.name)
	for (const editor of variableEditors) {
		editor.save()
	}
	const matches = verification.input.matchAll(/\$\{(\p{L}[\p{L}|\p{N}]*)\}/gu)
	const variables = [...matches].map(match => match[1])
	let result = verification.input
	for (const variable of variables) {
		// do not use template string since the variable is already ${variable}
		result = result.replace('${' + variable + '}', '"${' + variable + '}"')
		verification[variable] = byName[`var-${variable}`].value
	}
	verification.input = result
	return verification
}

function showVerificationError(field) {
	field.className = 'errored'
	throw new Error(`${field.name} cannot be empty`)
}


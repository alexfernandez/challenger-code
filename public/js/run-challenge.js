'use strict'

let codeMirror = null

window.onload = () => {
	console.log('loaded')
	codeMirror = CodeMirror.fromTextArea(document.getElementById('solution'), {
		mode:  'javascript',
		indentUnit: 4,
		indentWithTabs: true,
		lineWrapping: true,
		lineNumbers: true,
		autofocus: true,
		cursorBlinkRate: 0,
	})
	const send = document.getElementById('send')
	send.onclick = sendDocument
}

function sendDocument() {
	console.log('sending')
	codeMirror.save()
	document.getElementById('send').disabled = true
	const solution = document.getElementById('solution').value
	const body = {code: solution}
	const id = document.getElementById('challenge-id').innerText
	fetch(`/api/challenge/${id}/run`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	}).then(showResponse).catch(showError)
}

function showResponse(response) {
	document.getElementById('send').disabled = false
	document.getElementById('result').className = 'disabled'
	if (response.status != 200) {
		response.json().then(json => {
			document.getElementById('result').className = 'errored'
			const text = `${getSuccess(false)} ${response.status}`
			document.getElementById('success').innerText = text
			document.getElementById('error').className = ''
			document.getElementById('verifications').className = 'invisible'
			document.getElementById('error').innerText = json.error
		})
		return
	}
	response.json().then(json => {
		console.log(`Result: ${JSON.stringify(json)}`)
		document.getElementById('error').className = 'invisible'
		document.getElementById('verifications').className = ''
		const text = `${getSuccess(json.success)} in ${json.elapsed} ms with ${json.nodes} nodes`
		if (json.success) {
			document.getElementById('result').className = 'success'
		} else {
			document.getElementById('result').className = 'errored'
		}
		document.getElementById('success').innerText = text
		for (let i = 0; i < json.results.length; i++) {
			const result = json.results[i]
			document.getElementById(`name${i}`).innerText = result.name
			document.getElementById(`success${i}`).innerText = `${getSuccess(result.success)} in ${result.elapsed} ms`
		}
	})
}

function getSuccess(success) {
	if (success) return `✅ success`
	return `❌ failure`
}

function showError(error) {
	document.getElementById('send').disabled = false
	document.getElementById('success').innerText = `${getSuccess(false)} Could not send: ${error}`
}


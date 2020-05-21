'use strict'

let codeMirror = null

window.loaders.push(() => {
	const solution = localStorage.getItem('solution')
	if (solution) {
		document.getElementById('solution').value = solution
		localStorage.removeItem('solution')
	}
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
})

function sendDocument() {
	codeMirror.save()
	const solution = document.getElementById('solution').value
	if (!window.ccAuth) {
		localStorage.setItem('ccLocation', window.location)
		localStorage.setItem('ccSolution', solution)
		window.location = '/user/login'
		return
	}
	console.log('sending')
	document.getElementById('send').disabled = true
	const body = {code: solution}
	const id = document.getElementById('challenge-id').innerText
	fetch(`/api/challenge/main/${id}/run`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
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
			document.getElementById('error').innerText = json.error
		})
		return
	}
	response.json().then(json => {
		console.log(`Result: ${JSON.stringify(json)}`)
		document.getElementById('error').className = 'invisible'
		const text = `${getSuccess(json.success)} in ${json.elapsed} ms with ${json.nodes} nodes`
		document.getElementById('result').className = json.success ? 'success' : 'errored'
		document.getElementById('success').innerText = text
		for (let i = 0; i < json.results.length; i++) {
			const result = json.results[i]
			const success = document.getElementById(`success${i}`)
			success.className = result.success ? 'success' : 'errored'
			success.innerText = `${getSuccess(result.success)} in ${result.elapsed} ms`
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


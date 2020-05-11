'use strict'

window.onload = () => {
	console.log('loaded')
	const submit = document.getElementById('submit')
	submit.onclick = sendDocument
}

function sendDocument() {
	console.log('sending')
	document.getElementById('submit').disabled = true
	const solution = document.getElementById('solution').value
	const body = {code: solution}
	fetch('/api/challenge/higher-than/run', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	}).then(showResponse).catch(showError)
}

function showResponse(response) {
	document.getElementById('submit').disabled = false
	if (response.status != 200) {
		document.getElementById('success').innerHTML = `${getSuccess(false)} ${response.status}: ${response.statusText}`
		return
	}
	response.json().then(json => {
		console.log(`Result: ${JSON.stringify(json)}`)
		const text = `${getSuccess(json.success)} in ${json.elapsed} ms with ${json.nodes} nodes`
		document.getElementById('success').innerHTML = text
		for (let i = 0; i < json.results.length; i++) {
			const result = json.results[i]
			document.getElementById(`name${i}`).innerHTML = result.name
			document.getElementById(`success${i}`).innerHTML = `${getSuccess(result.success)} in ${result.elapsed} ms`
		}
	})
}

function getSuccess(success) {
	if (success) return `✅ success`
	return `❌ failure`
}

function showError(error) {
	document.getElementById('submit').disabled = false
	document.getElementById('success').innerHTML = `${getSuccess(false)} Could not send: ${error}`
}


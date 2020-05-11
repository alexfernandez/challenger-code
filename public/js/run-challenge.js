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
	const id = document.getElementById('challenge-id').innerText
	fetch(`/api/challenge/${id}/run`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	}).then(showResponse).catch(showError)
}

function showResponse(response) {
	document.getElementById('submit').disabled = false
	if (response.status != 200) {
		response.json().then(json => {
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
	document.getElementById('submit').disabled = false
	document.getElementById('success').innerText = `${getSuccess(false)} Could not send: ${error}`
}


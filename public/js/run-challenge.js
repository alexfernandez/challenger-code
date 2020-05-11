'use strict'

window.onload = () => {
	console.log('loaded')
	const submit = document.getElementById('submit')
	submit.onclick = sendDocument
}

function sendDocument() {
	console.log('sending')
	const solution = document.getElementById('solution').value
	const body = {code: solution}
	fetch('/api/challenge/higher-than/run', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {'content-type': 'application/json'},
	}).then(response => {
		if (response.status != 200) {
			document.getElementById('result').innerHTML = `${response.status}: ${response.statusText}`
			return
		}
		response.json().then(json => document.getElementById('result').innerHTML = JSON.stringify(json))
	})
}


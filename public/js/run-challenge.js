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
	}).then(response => {
		if (response.status != 200) {
			document.getElementById('result').innerHTML = `${response.status}: ${response.statusText}`
			return
		}
		response.json().then(json => {
			console.log(`Result: ${JSON.stringify(json)}`)
			document.getElementById('success').innerHTML = json.success
			document.getElementById('elapsed').innerHTML = json.elapsed
			for (let i = 0; i < json.results.length; i++) {
				const result = json.results[i]
				document.getElementById(`name${i}`).innerHTML = result.name
				document.getElementById(`success${i}`).innerHTML = result.success
				document.getElementById(`elapsed${i}`).innerHTML = result.elapsed
			}
		})
	})
}


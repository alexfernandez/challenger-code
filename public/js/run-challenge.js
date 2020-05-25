'use strict'

let codeMirror = null

window.loaders.push(() => {
	const solution = localStorage.getItem('ccSolution')
	if (solution) {
		document.getElementById('solution').value = solution
		localStorage.removeItem('ccSolution')
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
	document.getElementById('send').onclick = sendSolution
	if (!window.ccAuth) return
	document.getElementById('fork').onclick = forkChallenge
	if (window.ccAuth.role != 'admin') return
	document.getElementById('edit').className = ''
	document.getElementById('edit').onclick = editChallenge
})

function sendSolution() {
	codeMirror.save()
	const solution = document.getElementById('solution').value
	if (!window.ccAuth) {
		localStorage.setItem('ccLocation', window.location)
		localStorage.setItem('ccSolution', solution)
		window.location = '/user/login'
		return
	}
	console.log('sending')
	startFetch()
	const body = {code: solution}
	const id = document.getElementById('id').value
	const owner = document.getElementById('owner').value
	fetch(`/api/challenge/${owner}/${id}/run`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
	}).then(showResponse).catch(error => showError(`Could not send: ${error}`))
}

function showResponse(response) {
	stopFetch()
	document.getElementById('result').className = 'disabled'
	if (response.status != 200) {
		response.json().then(json => {
			document.getElementById('success').innerText = `${getSuccess(false)}`
			showError(`Could not send solution (${response.status}): ${json.error}`)
		})
		return
	}
	response.json().then(json => {
		const stats = json.stats
		document.getElementById('error').className = 'invisible'
		const text = `${getSuccess(json.success)}`
		document.getElementById('result').className = json.success ? 'success' : 'errored'
		document.getElementById('success').innerText = text
		for (let i = 0; i < json.results.length; i++) {
			const result = json.results[i]
			const success = document.getElementById(`success${i}`)
			success.className = result.success ? 'success' : 'errored'
			success.innerText = `${getSuccess(result.success)} in ${result.elapsed} ms`
		}
		if (!json.success) return
		const timeText = `${json.elapsed} ms, min: ${stats.elapsedMin}, avg: ${stats.elapsedAvg.toFixed(1)}`
		document.getElementById('time').innerText = timeText
		const nodesText = `${json.nodes} nodes, min: ${stats.nodesMin}, avg: ${stats.nodesAvg.toFixed(1)}`
		document.getElementById('nodes').innerText = nodesText
		document.getElementById('fork').className = ''
	})
}

function getSuccess(success) {
	if (success) return `✅ success`
	return `❌ failure`
}

function showError(error) {
	stopFetch()
	const element = document.getElementById('error')
	element.className = 'errored'
	element.innerText = error
}

function startFetch() {
	document.getElementById('send').disabled = true
	document.getElementById('fork').disabled = true
	document.getElementById('edit').disabled = true
	const element = document.getElementById('error')
	element.className = ''
	element.innerText = ''
	document.getElementById('loader').innerHTML = '<img class="loader" src="/img/loader.gif" />'
}

function stopFetch() {
	document.getElementById('send').disabled = false
	document.getElementById('fork').disabled = false
	document.getElementById('edit').disabled = false
	document.getElementById('loader').innerHTML = ''
}

function forkChallenge() {
	codeMirror.save()
	const solution = document.getElementById('solution').value
	const id = document.getElementById('id').value
	const owner = document.getElementById('owner').value
	const data = {
		owner: window.ccAuth.username,
		implementation: solution,
	}
	startFetch()
	fetch(`/api/challenge/${owner}/${id}/fork`, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'content-type': 'application/json',
			authorization: window.ccAuth.header,
		},
	}).then(response => {
		stopFetch()
		if (response.status != 200) {
			response.json().then(json => {
				showError(`Could not fork: ${json.error}`)
			})
			return
		}
		window.location = `/${window.ccAuth.username}/${id}/edit`
	}).catch(showError)
}

function editChallenge() {
	const id = document.getElementById('id').value
	const owner = document.getElementById('owner').value
	window.location = `/${owner}/${id}/edit`
}


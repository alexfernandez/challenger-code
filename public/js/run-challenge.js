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
	document.getElementById('send').onclick = () => {
		sendSolution().catch(error => showError(`Could not send: ${error}`))
	}
	if (!window.ccAuth) return
	document.getElementById('fork').onclick = () => {
		forkChallenge().catch(error => showError(`Could not fork: ${error}`))
	}
	if (window.ccAuth.role != 'admin') return
	document.getElementById('edit').className = ''
	document.getElementById('edit').onclick = editChallenge
})

async function sendSolution() {
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
	const id = document.getElementById('id').innerText
	const owner = document.getElementById('owner').innerText
	document.getElementById('run').className = 'disabled'
	const json = await window.apiFetch('run', `${owner}/${id}/run`, 'POST', body)
	stopFetch()
	const stats = json.stats
	const text = `${getSuccess(json.success)}`
	document.getElementById('run').className = json.success ? 'success' : 'errored'
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
}

function getSuccess(success) {
	if (success) return `✅ success`
	return `❌ failure`
}

function showError(error) {
	stopFetch()
	document.getElementById('result').className = 'errored'
	document.getElementById('result').innerText = error
}

function startFetch() {
	document.getElementById('send').disabled = true
	document.getElementById('fork').disabled = true
	document.getElementById('edit').disabled = true
	document.getElementById('result').className = ''
	document.getElementById('result').innerHTML = '<img class="loader" src="/img/loader.gif" />'
}

function stopFetch() {
	document.getElementById('send').disabled = false
	document.getElementById('fork').disabled = false
	document.getElementById('edit').disabled = false
	document.getElementById('result').className = ''
	document.getElementById('result').innerHTML = ''
}

async function forkChallenge() {
	codeMirror.save()
	const solution = document.getElementById('solution').value
	const id = document.getElementById('id').innerText
	const owner = document.getElementById('owner').innerText
	const data = {
		owner: window.ccAuth.username,
		implementation: solution,
	}
	startFetch()
	await window.apiFetch('fork', `${owner}/${id}/fork`, 'POST', data)
	stopFetch()
	window.location = `/${window.ccAuth.username}/${id}/edit`
}

function editChallenge() {
	const id = document.getElementById('id').innerText
	const owner = document.getElementById('owner').innerText
	window.location = `/${owner}/${id}/edit`
}


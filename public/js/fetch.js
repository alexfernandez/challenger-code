'use strict'


window.apiFetch = async function(operation, url, method, params) {
	const body = params ? JSON.stringify(params) : undefined
	const response = await fetch(`/api/challenge/${url}`, {
		method,
		body,
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${window.ccUser.token}`,
		},
	})
	if (response.status == 204) return
	const json = await response.json()
	if (response.status == 401) {
		return window.sendToLogin()
	}
	if (response.status != 200) {
		throw new Error(`Could  not ${operation} (${response.status}): ${json.error}`)
	}
	return json
}

window.Saving = class Saving {
	constructor(data) {
		this.codeMirror = data.codeMirror
		this.button = data.button
		this.buildBody = data.buildBody
		this.result = data.result
	}

	setup() {
		this.button.onclick = () => {
			this.saveChallenge().catch(error => this.showError(error))
		}
	}

	async saveChallenge() {
		if (!window.ccUser) {
			throw new Error('Invalid user')
		}
		console.log('saving')
		this.codeMirror.save()
		this.button.disabled = true
		this.result.className = ''
		this.result.innerHTML = '<img class="loader" src="/img/loader.gif" />'
		const body = this.buildBody()
		await window.apiFetch('save', `${body.owner}/${body.id}/save`, 'POST', body)
		this.button.disabled = false
		this.result.className = 'success'
		this.result.innerText = '✅ Challenge saved'
		setTimeout(() => {
			this.result.className = ''
			this.result.innerText = ''
		}, 5000)
	}

	showError(error) {
		console.error(error)
		this.button.disabled = false
		this.result.className = 'errored'
		this.result.innerText = `❌ Could not save: ${error}`
	}
}

window.Deletion = class Deletion {
	constructor(data) {
		this.owner = data.owner
		this.id = data.id
		this.button = data.button
		this.name = data.name
		this.result = data.result
		this.success = data.success
	}

	setup() {
		this.button.onclick = () => {
			this.deleteChallenge().catch(error => this.showError(error))
		}
	}

	async deleteChallenge() {
		this.button.disabled = true
		this.result.className = ''
		this.result.innerText = ''
		const sure = confirm(`Are you sure you want to delete challenge "${this.name}"?`)
		if (!sure) return
		await window.apiFetch('delete', `${this.owner}/${this.id}`, 'DELETE')
		this.button.disabled = false
		this.result.className = 'success'
		this.result.innerText = '✅ Challenge deleted'
		setTimeout(this.success, 2000)
	}

	showError(error) {
		this.button.disabled = false
		this.result.className = 'errored'
		this.result.innerText = `❌ Could not delete: ${error}`
	}
}


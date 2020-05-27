'use strict'


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
		if (!window.ccAuth) {
			throw new Error('Invalid authorization')
		}
		console.log('saving')
		this.codeMirror.save()
		this.button.disabled = true
		this.result.className = ''
		this.result.innerHTML = '<img class="loader" src="/img/loader.gif" />'
		const body = this.buildBody()
		const response = await fetch(`/api/challenge/${body.owner}/${body.id}/save`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'content-type': 'application/json',
				authorization: window.ccAuth.header,
			},
		})
		this.button.disabled = false
		this.result.innerText = ''
		const json = await response.json()
		if (response.status != 200) {
			this.showError(json.error)
			return
		}
		this.result.className = 'success'
		this.result.innerText = '✅ Challenge saved'
		setTimeout(() => {
			this.result.className = ''
			this.result.innerText = ''
		}, 5000)
	}

	showError(error) {
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
		const sure = confirm(`Are you sure you want to delete challenge ${this.name}?`)
		if (!sure) return
		const response = await fetch(`/api/challenge/${this.owner}/${this.id}`, {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json',
				authorization: window.ccAuth.header,
			},
		})
		this.button.disabled = false
		if (response.status != 204) {
			const json = await response.json()
			throw new Error(json.error)
		}
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


'use strict'


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
		if (response.status != 204) {
			const json = await response.json()
			throw new Error(json.error)
		}
		this.result.className = 'success'
		this.result.innerText = '✅ Challenge deleted'
		setTimeout(this.success, 2000)
	}

	showError(error) {
		this.result.className = 'errored'
		this.result.innerText = `❌ Could not delete: ${error}`
	}
}


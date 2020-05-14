'use strict'


window.onload = () => {
	for (const loader of window.loaders) {
		loader()
	}
	console.log('loaded')
}

window.loaders = [() => {
	const json = localStorage.getItem('auth')
	if (json) {
		const auth = JSON.parse(json)
		if (auth && auth.email) {
			document.getElementById('register').className = 'invisible'
			document.getElementById('useremail').innerText = auth.email
			document.getElementById('loggedin').className = ''
		}
	}
}]



'use strict'

window.loaders.push(() => {
	loadCreation().catch(console.error)
})

async function loadCreation() {
	window.addVerification()
}


const {router, get} = require('microrouter')

, fetch = require('node-fetch')

module.exports = router(
	// examples:
	// http://localhost/vehicles/2015/Audi/A3
	// http://localhost/vehicles/2015/Toyota/Yaris
	// http://localhost/vehicles/2013/Ford/Crown Victoria
	get('/vehicles/:modelYear/:manufacturer/*:model', async request =>
		(await fetch('https://one.nhtsa.gov/webapi/api/SafetyRatings/modelyear/' + request.params.modelYear + '/make/' + request.params.manufacturer + '/model/' + request.params.model
		 + '?format=json')).json()
	)
)
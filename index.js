const {json} = require('micro')
, {router, get, post} = require('microrouter')

, fetch = require('node-fetch')

, getVehicles = async (modelYear, manufacturer, model) =>
	(await fetch('https://one.nhtsa.gov/webapi/api/SafetyRatings/modelyear/' + modelYear + '/make/' + manufacturer + '/model/' + model + '?format=json')).json()
, filterVehicles = vehicles => ({
	Count: vehicles.Count
	, Results: vehicles.Results.map(vehicle => ({
		Description: vehicle.VehicleDescription
		, VehicleId: vehicle.VehicleId
	}))
})

module.exports = router(
	// examples:
	// http://localhost/vehicles/2015/Audi/A3
	// http://localhost/vehicles/2015/Toyota/Yaris
	// http://localhost/vehicles/2013/Ford/Crown Victoria
	get('/vehicles/:modelYear/:manufacturer/*:model', async request =>
		filterVehicles(
			await getVehicles(request.params.modelYear, request.params.manufacturer, request.params.model)
		)
	)
	, post('/vehicles', async request => {
		const {modelYear, manufacturer, model} = await json(request)

		return filterVehicles(
			await getVehicles(modelYear, manufacturer, model)
		)
	})
)
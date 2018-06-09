const {json} = require('micro')
, {router, get, post} = require('microrouter')

, fetch = require('node-fetch')

, getVehicles = async (modelYear, manufacturer, model) => {
	try {
		return await (await fetch('https://one.nhtsa.gov/webapi/api/SafetyRatings/modelyear/' + modelYear + '/make/' + manufacturer + '/model/' + model + '?format=json')).json()
	} catch (error) {
		return {
			Count: 0
			, Results: []
		}
	}
}
, filterVehicles = vehicles => ({
	Count: vehicles.Count
	, Results: vehicles.Results.map(vehicle => ({
		Description: vehicle.VehicleDescription
		, VehicleId: vehicle.VehicleId
	}))
})
, getVehiclesWithRating = async vehicles => {
	vehicles.Results = await Promise.all(vehicles.Results.map(async vehicle =>
		Object.assign({
			CrashRating: (await (await fetch('https://one.nhtsa.gov/webapi/api/SafetyRatings/VehicleId/' + vehicle.VehicleId + '?format=json')).json()).Results[0].OverallRating
		}, vehicle)
	))

	return vehicles
}
, getFilteredVehicles = async (modelYear, manufacturer, model, query) => {
	var result = filterVehicles(
		await getVehicles(modelYear, manufacturer, model)
	)

	if (query.withRating == 'true')
		result = getVehiclesWithRating(result)

	return result
}

module.exports = router(
	// examples:
	// http://localhost/vehicles/2015/Audi/A3
	// http://localhost/vehicles/2015/Toyota/Yaris
	// http://localhost/vehicles/2013/Ford/Crown Victoria
	get('/vehicles/:modelYear/:manufacturer/*:model', async request =>
		getFilteredVehicles(request.params.modelYear, request.params.manufacturer, request.params.model, request.query)
	)
	, post('/vehicles', async request => {
		const {modelYear, manufacturer, model} = await json(request)

		return getFilteredVehicles(modelYear, manufacturer, model, request.query)
	})
)
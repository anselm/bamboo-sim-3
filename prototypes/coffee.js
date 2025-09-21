import { prototypical_entity } from './entity.js';

// A coffee plant prototype - clone to use
export const prototypical_coffee_plant = {
	...prototypical_entity,

	metadata: {
		title: 'Coffee Plant',
		description: 'Arabica coffee plant suitable for shade-grown intercropping',
		unsplashImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e'
	},

	age: 0,
	
	// Coffee plant constants
	USD_PER_KG_CHERRIES: 2.5,  // Price per kg of coffee cherries
	KG_CHERRIES_PER_PLANT_YEAR: 2.5,  // Average yield per mature plant per year
	CO2_KG_PER_PLANT: 0.5,  // Annual CO2 sequestration
	JOULES_PER_HARVEST: 1800000,  // 0.5 kWh per plant harvest
	JOULES_PER_PLANTING: 3600000,  // 1 kWh to plant
	
	// Growth parameters
	MAX_HEIGHT_METERS: 2.5,  // Coffee plants kept pruned to 2.5m
	GROWTH_RATE: 0.015,
	GROWTH_MIDPOINT_DAYS: 365,  // Slower growth than bamboo
	MATURITY_DAYS: 1095,  // 3 years to first harvest
	HARVEST_SEASON_START: 270,  // Day of year (roughly October)
	HARVEST_SEASON_END: 30,  // Day of year (roughly January)
	
	// Intercropping benefits (multipliers)
	SOIL_HEALTH_BENEFIT: 1.05,  // 5% improvement to nearby plants
	MOISTURE_RETENTION: 1.03,  // 3% better water retention
	
	// State
	totalHarvested: 0,
	totalValue: 0,
	totalCO2: 0
}

prototypical_coffee_plant.ontick = function(daysElapsed) {
	const plant = this
	plant.age += daysElapsed
	
	// S-curve growth similar to bamboo but slower
	plant.volume.hwd[0] = plant.MAX_HEIGHT_METERS / (1 + Math.exp(-plant.GROWTH_RATE * (plant.age - plant.GROWTH_MIDPOINT_DAYS)))
	
	// Coffee plants are bushier
	plant.volume.hwd[1] = plant.volume.hwd[0] * 0.8  // Width is 80% of height
	plant.volume.hwd[2] = plant.volume.hwd[1]  // Depth same as width
}

prototypical_coffee_plant.onharvest = function(dayOfYear) {
	const plant = this
	
	// Check if mature and in harvest season
	if (plant.age < plant.MATURITY_DAYS) return { kg: 0, value: 0, co2: 0 }
	
	// Check if in harvest season (handles year boundary)
	const inSeason = (plant.HARVEST_SEASON_START > plant.HARVEST_SEASON_END) ?
		(dayOfYear >= plant.HARVEST_SEASON_START || dayOfYear <= plant.HARVEST_SEASON_END) :
		(dayOfYear >= plant.HARVEST_SEASON_START && dayOfYear <= plant.HARVEST_SEASON_END)
	
	if (!inSeason) return { kg: 0, value: 0, co2: 0 }
	
	// Calculate yield based on age (peaks around year 7-10)
	const ageYears = plant.age / 365
	const yieldMultiplier = Math.min(1, (ageYears - 3) / 4)  // Ramps up from year 3 to 7
	const kgHarvested = plant.KG_CHERRIES_PER_PLANT_YEAR * yieldMultiplier
	const value = kgHarvested * plant.USD_PER_KG_CHERRIES
	
	// Update totals
	plant.totalHarvested += kgHarvested
	plant.totalValue += value
	plant.totalCO2 += plant.CO2_KG_PER_PLANT
	
	return { kg: kgHarvested, value, co2: plant.CO2_KG_PER_PLANT }
}

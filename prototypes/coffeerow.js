import { prototypical_entity } from './entity.js';
import { prototypical_coffee_plant } from './coffee.js';
import { deepClone } from '../utils/deepClone.js';
import { sys } from '../utils/sys.js';

// A coffee row prototype - organizes coffee plants in rows between bamboo
export const prototypical_coffee_row = {
	...prototypical_entity,
	
	kind: 'coffeerow',

	metadata: {
		title: 'Coffee Row',
		description: 'A row of coffee plants for intercropping between bamboo clumps',
		unsplashImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'
	},

	coffeerow: {
		PLANTS_PER_ROW: 10,
		PLANT_SPACING: 2,  // 2 meters between plants
		ROW_WIDTH: 2,  // Width of the row
		
		// Accumulated statistics
		totalHarvested: 0,
		totalValue: 0,
		totalCO2: 0,
		totalCostJoules: 0
	}
}

prototypical_coffee_row.onreset = function() {
	const row = this
	row.children = []
	row.createdat = row.updatedat = performance.now()
	
	// Initialize statistics
	row.coffeerow.totalHarvested = 0
	row.coffeerow.totalValue = 0
	row.coffeerow.totalCO2 = 0
	row.coffeerow.totalCostJoules = 0
	
	// Create coffee plants along the row
	for (let i = 0; i < row.coffeerow.PLANTS_PER_ROW; i++) {
		const plant = deepClone(prototypical_coffee_plant)
		plant.parent = row.id
		plant.id = row.id + "/" + (i + 1)
		plant.createdat = performance.now()
		
		// Position plants along the row (assuming row runs along X axis)
		plant.volume.xyz = [
			row.volume.xyz[0] + (i * row.coffeerow.PLANT_SPACING),
			0,
			row.volume.xyz[2]
		]
		
		plant.coffee.age = 0
		row.coffeerow.totalCostJoules += plant.coffee.JOULES_PER_PLANTING
		row.children.push(plant)
		sys(plant)
	}
}

prototypical_coffee_row.onharvest = function(dayOfYear) {
	const self = this
	let totalKg = 0
	let totalValue = 0
	let totalCO2 = 0
	
	self.children.forEach(plant => {
		const harvest = plant.onharvest(dayOfYear)
		totalKg += harvest.kg
		totalValue += harvest.value
		totalCO2 += harvest.co2
		
		if (harvest.kg > 0) {
			self.coffeerow.totalCostJoules += plant.coffee.JOULES_PER_HARVEST
		}
	})
	
	// Accumulate in row
	self.coffeerow.totalHarvested += totalKg
	self.coffeerow.totalValue += totalValue
	self.coffeerow.totalCO2 += totalCO2
	
	return { kg: totalKg, value: totalValue, co2: totalCO2 }
}

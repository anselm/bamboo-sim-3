import { prototypical_entity } from './entity.js';
import { prototypical_dendrocalamus_asper_clump } from './clump.js';
import { prototypical_coffee_row } from './coffeerow.js';
import { deepClone } from '../utils/deepClone.js';
import { sys } from '../utils/sys.js';

// A prototypical plot
export const prototypical_plot = {
	...prototypical_entity,
	
	metadata: {
		title: 'Bamboo Plot',
		description: 'A managed plot of land for growing bamboo',
		unsplashImage: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f'
	},
	
	// Field configuration
	field: {
		width: 100,  // Default width in meters
		depth: 100,  // Default depth in meters
		USD_PER_MEGAJOULE: 0.0278, // Based on $0.10 per kWh (1 kWh = 3.6 MJ)
		ENABLE_INTERCROPPING: false,
		COFFEE_ROW_SPACING: 4,  // Place coffee rows every 4 meters
	},
	
	// Statistics
	stats: {
		// Accumulated totals
		cumulativeHarvest: 0,
		cumulativeValue: 0,
		cumulativeCO2: 0,
		cumulativeCostJoules: 0,
		
		// Time series data
		days: [],
		totalGrowth: [],
		totalHarvest: [],
		economicYield: [],
		co2Sequestered: [],
		energyCostJoules: []
	}
}

prototypical_plot.onreset = function() {
	const plot = this
	plot.children = []
	plot.createdat = plot.updatedat = performance.now()
	plot.volume.hwd = [plot.field.width, 0, plot.field.depth]
	
	// Reset all statistics
	plot.stats = {
		// Accumulated totals
		cumulativeHarvest: 0,
		cumulativeValue: 0,
		cumulativeCO2: 0,
		cumulativeCostJoules: 0,
		
		// Time series data
		days: [],
		totalGrowth: [],
		totalHarvest: [],
		economicYield: [],
		co2Sequestered: [],
		energyCostJoules: []
	}
	const ref = prototypical_dendrocalamus_asper_clump
	let counter = 1
	
	// Ensure minimum spacing accounts for clump width
	const minSpacing = Math.max(ref.clump.CLUMP_GAP_PER_AXIS, ref.clump.CLUMP_MAX_WIDTH)
	console.log(`Creating clumps with ${minSpacing}m spacing (clump width: ${ref.clump.CLUMP_MAX_WIDTH}m)...`)
	
	// Start with offset to center clumps in plot
	const startOffset = minSpacing / 2
	
	for(let x = startOffset; x < plot.field.width; x += minSpacing) {
		for(let z = startOffset; z < plot.field.depth; z += minSpacing) {
			const clump = deepClone(ref)
			clump.parent = plot.id
			clump.id = plot.id + "/" + counter
			clump.volume.xyz = [x, 0, z]
			plot.children.push(clump)
			sys(clump)
			
			if (counter % 50 === 0) {
				console.log(`  Created ${counter} clumps...`)
			}
			
			counter++
		}
	}
	
	console.log(`  Total clumps created: ${plot.children.filter(c => c.metadata.title === 'Bamboo Clump').length}`)
	console.log(`  Actual density: ${(plot.children.filter(c => c.metadata.title === 'Bamboo Clump').length / (plot.field.width * plot.field.depth / 10000)).toFixed(2)} clumps per hectare`)
	
	// Add coffee rows if intercropping is enabled
	if (plot.field.ENABLE_INTERCROPPING) {
		console.log(`\nAdding coffee rows for intercropping...`)
		let coffeeCounter = 1
		
		// Place coffee rows between bamboo clumps
		for (let z = startOffset + plot.field.COFFEE_ROW_SPACING; z < plot.field.depth - plot.field.COFFEE_ROW_SPACING; z += minSpacing) {
			// Skip rows that would be too close to bamboo
			if ((z - startOffset) % minSpacing < plot.field.COFFEE_ROW_SPACING) continue
			
			const coffeeRow = deepClone(prototypical_coffee_row)
			coffeeRow.parent = plot.id
			coffeeRow.id = plot.id + "/coffee/" + coffeeCounter
			coffeeRow.volume.xyz = [startOffset, 0, z]
			plot.children.push(coffeeRow)
			sys(coffeeRow)
			coffeeCounter++
		}
		
		console.log(`  Total coffee rows created: ${coffeeCounter - 1}`)
		console.log(`  Total coffee plants: ${(coffeeCounter - 1) * prototypical_coffee_row.coffeerow.PLANTS_PER_ROW}`)
	}
}

prototypical_plot.onstep = function(daysElapsed) {
	const plot = this
	
	// Growth phase - update all plants
	let totalBambooHeight = 0
	let culmCount = 0
	let totalCoffeeHeight = 0
	let coffeePlantCount = 0
	
	plot.children.forEach(entity => {
		if (entity.metadata.title === 'Bamboo Clump') {
			entity.children.forEach(culm => {
				culm.ontick(daysElapsed)
				totalBambooHeight += culm.volume.hwd[0]
				culmCount++
			})
		} else if (entity.metadata.title === 'Coffee Row') {
			entity.children.forEach(plant => {
				plant.ontick(daysElapsed)
				totalCoffeeHeight += plant.volume.hwd[0]
				coffeePlantCount++
			})
		}
	})
	
	// Harvest phase - check bamboo and coffee
	let stepBambooHarvest = 0
	let stepCoffeeHarvest = 0
	let stepValue = 0
	let stepCO2 = 0
	let stepCostJoules = 0
	
	// Calculate day of year for coffee harvest timing
	const dayOfYear = (plot.stats.days[plot.stats.days.length - 1] || 0) % 365
	
	plot.children.forEach(entity => {
		if (entity.metadata.title === 'Bamboo Clump') {
			const beforeHarvest = entity.clump.totalHarvested
			const beforeCost = entity.clump.totalCostJoules
			
			entity.onharvest()
			
			stepBambooHarvest += entity.clump.totalHarvested - beforeHarvest
			stepCostJoules += entity.clump.totalCostJoules - beforeCost
		} else if (entity.metadata.title === 'Coffee Row') {
			const beforeHarvest = entity.coffeerow.totalHarvested
			const beforeCost = entity.coffeerow.totalCostJoules
			
			entity.onharvest(dayOfYear)
			
			stepCoffeeHarvest += entity.coffeerow.totalHarvested - beforeHarvest
			stepCostJoules += entity.coffeerow.totalCostJoules - beforeCost
		}
	})
	
	// Update plot cumulative stats from clumps
	plot.stats.cumulativeHarvest = 0
	plot.stats.cumulativeValue = 0
	plot.stats.cumulativeCO2 = 0
	plot.stats.cumulativeCostJoules = 0
	
	plot.children.forEach(entity => {
		if (entity.metadata.title === 'Bamboo Clump') {
			plot.stats.cumulativeHarvest += entity.clump.totalHarvested
			plot.stats.cumulativeValue += entity.clump.totalValue
			plot.stats.cumulativeCO2 += entity.clump.totalCO2
			plot.stats.cumulativeCostJoules += entity.clump.totalCostJoules
		} else if (entity.metadata.title === 'Coffee Row') {
			plot.stats.cumulativeValue += entity.coffeerow.totalValue
			plot.stats.cumulativeCO2 += entity.coffeerow.totalCO2
			plot.stats.cumulativeCostJoules += entity.coffeerow.totalCostJoules
		}
	})
	
	// Record statistics
	const currentDay = plot.stats.days.length > 0 
		? plot.stats.days[plot.stats.days.length - 1] + daysElapsed 
		: daysElapsed
		
	plot.stats.days.push(currentDay)
	plot.stats.totalGrowth.push(totalBambooHeight / (culmCount || 1)) // average bamboo height
	plot.stats.totalHarvest.push(plot.stats.cumulativeHarvest)
	plot.stats.economicYield.push(plot.stats.cumulativeValue)
	plot.stats.co2Sequestered.push(plot.stats.cumulativeCO2)
	plot.stats.energyCostJoules.push(plot.stats.cumulativeCostJoules)
	
	// Return step info for logging
	return {
		currentDay,
		avgBambooHeight: totalBambooHeight / (culmCount || 1),
		avgCoffeeHeight: totalCoffeeHeight / (coffeePlantCount || 1),
		stepBambooHarvest,
		stepCoffeeHarvest,
		culmCount,
		coffeePlantCount
	}
}

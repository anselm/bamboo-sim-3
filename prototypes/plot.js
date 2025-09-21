import { prototypical_entity } from './entity.js';
import { prototypical_dendrocalamus_asper_clump } from './clump.js';
import { deepClone } from '../utils/deepClone.js';

// A prototypical plot
export const prototypical_plot = {
	...prototypical_entity,
	
	title: 'Bamboo Plot',
	description: 'A managed plot of land for growing bamboo',
	unsplashImage: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
	
	// Accumulated statistics
	cumulativeHarvest: 0,
	cumulativeValue: 0,
	cumulativeCO2: 0,
	cumulativeCostJoules: 0,
	
	// Simulation history
	simulationStats: {
		days: [],
		totalGrowth: [],
		totalHarvest: [],
		economicYield: [],
		co2Sequestered: [],
		energyCostJoules: []
	}
}

prototypical_plot.onreset = function({width,depth}) {
	const plot = this
	plot.children = []
	plot.createdat = plot.updatedat = performance.now()
	plot.volume.hwd = [width,0,depth]
	
	// Initialize accumulated statistics
	plot.cumulativeHarvest = 0
	plot.cumulativeValue = 0
	plot.cumulativeCO2 = 0
	plot.cumulativeCostJoules = 0
	
	// Reset simulation history
	plot.simulationStats = {
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
	const minSpacing = Math.max(ref.CLUMP_GAP_PER_AXIS, ref.CLUMP_MAX_WIDTH)
	console.log(`Creating clumps with ${minSpacing}m spacing (clump width: ${ref.CLUMP_MAX_WIDTH}m)...`)
	
	// Start with offset to center clumps in plot
	const startOffset = minSpacing / 2
	
	for(let x = startOffset; x < width; x += minSpacing) {
		for(let z = startOffset; z < depth; z += minSpacing) {
			const clump = deepClone(ref)
			clump.parent = plot.id
			clump.id = plot.id + "/" + counter
			clump.volume.xyz = [x, 0, z]
			clump.onreset()
			plot.children.push(clump)
			
			if (counter % 50 === 0) {
				console.log(`  Created ${counter} clumps...`)
			}
			
			counter++
		}
	}
	
	console.log(`  Total clumps created: ${plot.children.length}`)
	console.log(`  Actual density: ${(plot.children.length / (width * depth / 10000)).toFixed(2)} clumps per hectare`)
}

prototypical_plot.onstep = function(daysElapsed) {
	const plot = this
	
	// Growth phase - update all culms
	let totalHeight = 0
	let culmCount = 0
	
	plot.children.forEach(clump => {
		clump.children.forEach(culm => {
			culm.ontick(daysElapsed)
			totalHeight += culm.volume.hwd[0]
			culmCount++
		})
	})
	
	// Harvest phase - check each clump
	let stepHarvest = 0
	let stepValue = 0
	let stepCO2 = 0
	let stepCostJoules = 0
	
	plot.children.forEach(clump => {
		const beforeHarvest = clump.totalHarvested
		const beforeCost = clump.totalCostJoules
		
		clump.onharvest()
		
		stepHarvest += clump.totalHarvested - beforeHarvest
		stepCostJoules += clump.totalCostJoules - beforeCost
	})
	
	// Update plot cumulative stats from clumps
	plot.cumulativeHarvest = 0
	plot.cumulativeValue = 0
	plot.cumulativeCO2 = 0
	plot.cumulativeCostJoules = 0
	
	plot.children.forEach(clump => {
		plot.cumulativeHarvest += clump.totalHarvested
		plot.cumulativeValue += clump.totalValue
		plot.cumulativeCO2 += clump.totalCO2
		plot.cumulativeCostJoules += clump.totalCostJoules
	})
	
	// Record statistics
	const currentDay = plot.simulationStats.days.length > 0 
		? plot.simulationStats.days[plot.simulationStats.days.length - 1] + daysElapsed 
		: daysElapsed
		
	plot.simulationStats.days.push(currentDay)
	plot.simulationStats.totalGrowth.push(totalHeight / culmCount) // average height
	plot.simulationStats.totalHarvest.push(plot.cumulativeHarvest)
	plot.simulationStats.economicYield.push(plot.cumulativeValue)
	plot.simulationStats.co2Sequestered.push(plot.cumulativeCO2)
	plot.simulationStats.energyCostJoules.push(plot.cumulativeCostJoules)
	
	// Return step info for logging
	return {
		currentDay,
		avgHeight: totalHeight / culmCount,
		stepHarvest,
		culmCount
	}
}

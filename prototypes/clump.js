import { prototypical_entity } from './entity.js';
import { prototypical_dendrocalamus_asper_culm } from './culm.js';
import { deepClone } from '../utils/deepClone.js';

// A dendrocalamus asper clump prototype - clone to use
export const prototypical_dendrocalamus_asper_clump = {
	...prototypical_entity,

	title: 'Bamboo Clump',
	description: 'A clump of giant bamboo containing up to 40 individual culms',
	unsplashImage: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50',

	CULM_MAX: 40,
	CLUMP_PER_HECTARE: 150,
	CLUMP_GAP_PER_AXIS: 8,
	CLUMP_MAX_WIDTH: 12,  // Maximum width of a clump in meters
	HARVEST_FIRST_DAY: 1825,
	HARVEST_PERCENT: 20.0,
	JOULES_PER_CLUMP_PLANTING: 36000000, // 10 kWh = 36 MJ (energy to plant a clump)
	
	// Accumulated statistics
	totalHarvested: 0,
	totalValue: 0,
	totalCO2: 0,
	totalCostJoules: 0
}

prototypical_dendrocalamus_asper_clump.onreset = function() {
	const clump = this
	clump.children = []
	clump.createdat = this.updatedat = performance.now()
	
	// Initialize statistics
	clump.totalHarvested = 0
	clump.totalValue = 0
	clump.totalCO2 = 0
	clump.totalCostJoules = clump.JOULES_PER_CLUMP_PLANTING // Initial planting cost
	
	const max = this.CULM_MAX
	let counter = 1
	
	// Distribute culms within the clump area (up to 12m diameter)
	// Using a circular distribution pattern
	const clumpRadius = this.CLUMP_MAX_WIDTH / 2
	
	for(let i = 0; i < max; i++) {
		const culm = deepClone(prototypical_dendrocalamus_asper_culm)
		culm.parent = clump.id
		culm.id = clump.id + "/" + counter
		culm.createdat = performance.now()
		
		// Position culms randomly within the clump area
		// Use polar coordinates for natural circular distribution
		const angle = Math.random() * 2 * Math.PI
		const distance = Math.random() * clumpRadius * 0.8 // Keep within 80% of radius
		culm.volume.xyz = [
			clump.volume.xyz[0] + Math.cos(angle) * distance,
			0,
			clump.volume.xyz[2] + Math.sin(angle) * distance
		]
		
		culm.volume.hwd = [0, 0, 0] // height, width, depth - will grow over time
		culm.age = 0 // age in days
		counter++
		clump.children.push(culm)
	}
}

// Harvesting system
prototypical_dendrocalamus_asper_clump.onharvest = function() {
	const clump = this
	const harvestableAge = this.HARVEST_FIRST_DAY
	const harvestPercent = this.HARVEST_PERCENT / 100
	
	// Find mature culms
	const matureCulms = clump.children.filter(culm => culm.age >= harvestableAge)
	const harvestCount = Math.floor(matureCulms.length * harvestPercent)
	
	if (harvestCount === 0) return { count: 0, value: 0, co2: 0 }
	
	// Sort by age and harvest oldest first
	matureCulms.sort((a, b) => b.age - a.age)
	
	let totalValue = 0
	let totalCO2 = 0
	
	for (let i = 0; i < harvestCount; i++) {
		const culm = matureCulms[i]
		totalValue += culm.USD_PER_CULM
		totalCO2 += culm.CO2_KG_PER_CULM
		
		// Add harvesting energy cost
		clump.totalCostJoules += culm.JOULES_PER_HARVEST
		
		// Reset harvested culm to newborn state
		culm.age = 0
		culm.volume.hwd = [0, 0, 0]
		culm.createdat = performance.now()
	}
	
	// Accumulate in clump
	clump.totalHarvested += harvestCount
	clump.totalValue += totalValue
	clump.totalCO2 += totalCO2
	
	return { count: harvestCount, value: totalValue, co2: totalCO2 }
}

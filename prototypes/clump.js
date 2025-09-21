import { prototypical_entity } from './entity.js';
import { prototypical_dendrocalamus_asper_culm } from './culm.js';
import { deepClone } from '../utils/deepClone.js';

// A dendrocalamus asper clump prototype - clone to use
export const prototypical_dendrocalamus_asper_clump = {
	...prototypical_entity,

	CULM_MAX: 40,
	CLUMP_PER_HECTARE: 150,
	CLUMP_GAP_PER_AXIS: 8,
	HARVEST_FIRST_DAY: 1825,
	HARVEST_PERCENT: 20.0
}

prototypical_dendrocalamus_asper_clump.onreset = function() {
	const clump = this
	clump.children = []
	clump.createdat = this.updatedat = performance.now()
	const max = this.CULM_MAX
	let counter = 1
	for(let i = 0; i < max; i++) {
		const culm = deepClone(prototypical_dendrocalamus_asper_culm)
		culm.parent = clump.id
		culm.id = clump.id + "/" + counter
		culm.createdat = performance.now()
		culm.xyz = [clump.xyz[0], 0, clump.xyz[2]]
		culm.hwd = [0, 0, 0] // height, width, depth - will grow over time
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
		
		// Reset harvested culm to newborn state
		culm.age = 0
		culm.hwd = [0, 0, 0]
		culm.createdat = performance.now()
	}
	
	return { count: harvestCount, value: totalValue, co2: totalCO2 }
}

import { prototypical_entity } from './entity.js';

// A dendrocalamus asper culm prototype - clone to use
export const prototypical_dendrocalamus_asper_culm = {
	...prototypical_entity,

	USD_PER_CULM: 12.0,
	CO2_KG_PER_CULM: 2.21,
	
	// Growth parameters
	MAX_HEIGHT_METERS: 30,        // Giant bamboo can reach 30m
	GROWTH_RATE: 0.02,           // Controls steepness of S-curve
	GROWTH_MIDPOINT_DAYS: 180,   // Days when growth is fastest (6 months)
	WIDTH_TO_HEIGHT_RATIO: 0.005 // Roughly 15cm diameter at full height
}

prototypical_dendrocalamus_asper_culm.ontick = function(daysElapsed) {
	const culm = this
	culm.age += daysElapsed
	
	// S-curve growth: rapid at first, slowing with age
	// Using logistic growth function
	// Logistic S-curve formula
	culm.hwd[0] = culm.MAX_HEIGHT_METERS / (1 + Math.exp(-culm.GROWTH_RATE * (culm.age - culm.GROWTH_MIDPOINT_DAYS)))
	
	// Width grows proportionally but slower
	culm.hwd[1] = culm.hwd[0] * culm.WIDTH_TO_HEIGHT_RATIO
	culm.hwd[2] = culm.hwd[1] // depth same as width (circular)
}

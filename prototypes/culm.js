import { prototypical_entity } from './entity.js';

// A dendrocalamus asper culm prototype - clone to use
export const prototypical_dendrocalamus_asper_culm = {
	...prototypical_entity,

	USD_PER_CULM: 12.0,
	CO2_KG_PER_CULM: 2.21
}

prototypical_dendrocalamus_asper_culm.ontick = function(daysElapsed) {
	const culm = this
	culm.age += daysElapsed
	
	// S-curve growth: rapid at first, slowing with age
	// Using logistic growth function
	const maxHeight = 30 // meters (giant bamboo can reach 30m)
	const growthRate = 0.02 // controls steepness of S-curve
	const midpoint = 180 // days when growth is fastest (6 months)
	
	// Logistic S-curve formula
	culm.hwd[0] = maxHeight / (1 + Math.exp(-growthRate * (culm.age - midpoint)))
	
	// Width grows proportionally but slower
	culm.hwd[1] = culm.hwd[0] * 0.005 // roughly 15cm diameter at full height
	culm.hwd[2] = culm.hwd[1] // depth same as width (circular)
}

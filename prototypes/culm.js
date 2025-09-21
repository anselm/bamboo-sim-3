import { prototypical_entity } from './entity.js';

// A dendrocalamus asper culm prototype - clone to use
export const prototypical_dendrocalamus_asper_culm = {
	...prototypical_entity,

	title: 'Giant Bamboo Culm',
	description: 'A single pole of Dendrocalamus asper, one of the largest bamboo species',
	unsplashImage: 'https://images.unsplash.com/photo-1567450489212-d37b5ba1b639',

	age:0,

	USD_PER_CULM: 12.0,
	CO2_KG_PER_CULM: 2.21,
	JOULES_PER_HARVEST: 3600000, // 1 kWh = 3.6 MJ (rough estimate for harvesting energy)
	
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
	culm.volume.hwd[0] = culm.MAX_HEIGHT_METERS / (1 + Math.exp(-culm.GROWTH_RATE * (culm.age - culm.GROWTH_MIDPOINT_DAYS)))
	
	// Width grows proportionally but slower
	culm.volume.hwd[1] = culm.volume.hwd[0] * culm.WIDTH_TO_HEIGHT_RATIO
	culm.volume.hwd[2] = culm.volume.hwd[1] // depth same as width (circular)
}

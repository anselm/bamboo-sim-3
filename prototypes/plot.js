import { prototypical_entity } from './entity.js';
import { prototypical_dendrocalamus_asper_clump } from './clump.js';
import { deepClone } from '../utils/deepClone.js';

// A prototypical plot
export const prototypical_plot = {
	...prototypical_entity,
}

prototypical_plot.onreset = function({width,depth}) {
	const plot = this
	plot.children = []
	plot.createdat = plot.updatedat = performance.now()
	plot.hwd = [width,0,depth]
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
			clump.xyz = [x, 0, z]
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

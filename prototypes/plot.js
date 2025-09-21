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
	
	console.log(`Creating clumps with ${ref.CLUMP_GAP_PER_AXIS}m spacing...`)
	
	for(let x = 0; x < width; x += ref.CLUMP_GAP_PER_AXIS) {
		for(let z = 0; z < depth; z += ref.CLUMP_GAP_PER_AXIS) {
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
}

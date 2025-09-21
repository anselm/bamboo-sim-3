
/*

I'm thinking of a way to represent or simulate an agent based model of a field of bamboo. Later there would be more kinds of agents. Some of my goals are:

1) A succint ecs patterned, prototype based model of each agent, where I clone a prototype, and then run systems over clusters of related instances to do work.

2) A reasonable model of a dendrocalamus asper, or giant bamboo, which grows in clumps that are about 6 meters apart, and where each clump has up to 40 individual poles (or culm as they are called). Growth of poles is on an s-curve, rapidly at first and slowing down towards old age. Harvesting of a clump starts at about 20% of that clump at about the 5 year mark. And and each pole is worth about $12, and there is some estimate of co2 sequestration per pole, more mature clumps can sequester 2.24 kg per pole. There are usually 150 clumps per square hectare (a hectare is 10000 square meters)

3) Utter code clarity, just really easy for me as a programmer to understand

Here are my thoughts so far:

*/

// Run the simulation when the file is loaded
main()

//
// basic prototypical entities share these properties
//

const prototypical_entity = {
	id: 0,
	xyz: [ 0,0,0 ],
	hwd: [ 0,0,0 ],
	ypr: [ 0,0,0 ],
	parent: 0,
	children: [],
	createdat: null,	
}

//
// a dendrocalamus asper culm prototype - clone to use
//

const prototypical_dendrocalamus_asper_culm = {

	...prototypical_entity,

	USD_PER_CULM: 12.0,
	CO2_KG_PER_CULM: 2.21
}

//
// a dendrocalamus asper clump prototype - clone to use
//

const prototypical_dendrocalamus_asper_clump = {

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
		const culm = structuredClone(prototypical_dendrocalamus_asper_culm)
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

//
// a prototypical plot
//

const prototypical_plot = {
	...prototypical_entity,
}

prototypical_plot.onreset = ({width,depth}) => {
	const plot = this
	plot.children = []
	plot.createdat = plot.updatedat = performance.now()
	plot.hwd = [width,0,depth]
	const ref = prototypical_dendrocalamus_asper_clump
	let counter = 1
	for(let x = 0; x != width;x+=ref.CLUMP_GAP_PER_AXIS) {
		for(let z=0; z != depth;z+=ref.CLUMP_GAP_PER_AXIS) {
			const clump = structuredClone(ref)
			clump.parent = plot.id
			clump.id = plot.id + "/" + counter
			clump.xyz = [x, 0, z]
			clump.onreset()
			plot.children.push(clump)
			counter++
		}
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
		
		// Remove harvested culm
		const index = clump.children.indexOf(culm)
		clump.children.splice(index, 1)
		
		// Add new culm to replace harvested one
		const newCulm = structuredClone(prototypical_dendrocalamus_asper_culm)
		newCulm.parent = clump.id
		newCulm.id = clump.id + "/" + Date.now() + Math.random()
		newCulm.createdat = performance.now()
		newCulm.xyz = [clump.xyz[0], 0, clump.xyz[2]]
		newCulm.hwd = [0, 0, 0]
		newCulm.age = 0
		clump.children.push(newCulm)
	}
	
	return { count: harvestCount, value: totalValue, co2: totalCO2 }
}

// Simulation statistics
const simulationStats = {
	days: [],
	totalGrowth: [],
	totalHarvest: [],
	economicYield: [],
	co2Sequestered: []
}

// Main simulation function
function runSimulation(plot, years = 10, daysPerStep = 30) {
	const totalDays = years * 365
	const steps = Math.floor(totalDays / daysPerStep)
	
	// Reset stats
	simulationStats.days = []
	simulationStats.totalGrowth = []
	simulationStats.totalHarvest = []
	simulationStats.economicYield = []
	simulationStats.co2Sequestered = []
	
	let cumulativeHarvest = 0
	let cumulativeValue = 0
	let cumulativeCO2 = 0
	
	for (let step = 0; step < steps; step++) {
		const currentDay = step * daysPerStep
		
		// Growth phase - update all culms
		let totalHeight = 0
		let culmCount = 0
		
		plot.children.forEach(clump => {
			clump.children.forEach(culm => {
				culm.ontick(daysPerStep)
				totalHeight += culm.hwd[0]
				culmCount++
			})
		})
		
		// Harvest phase - check each clump
		let stepHarvest = 0
		let stepValue = 0
		let stepCO2 = 0
		
		plot.children.forEach(clump => {
			const harvest = clump.onharvest()
			stepHarvest += harvest.count
			stepValue += harvest.value
			stepCO2 += harvest.co2
		})
		
		cumulativeHarvest += stepHarvest
		cumulativeValue += stepValue
		cumulativeCO2 += stepCO2
		
		// Record statistics
		simulationStats.days.push(currentDay)
		simulationStats.totalGrowth.push(totalHeight / culmCount) // average height
		simulationStats.totalHarvest.push(cumulativeHarvest)
		simulationStats.economicYield.push(cumulativeValue)
		simulationStats.co2Sequestered.push(cumulativeCO2)
		
		// Log progress every year
		if (currentDay % 365 === 0 && currentDay > 0) {
			console.log(`Year ${currentDay / 365}:`)
			console.log(`  Average culm height: ${(totalHeight / culmCount).toFixed(2)}m`)
			console.log(`  Total harvested: ${cumulativeHarvest} culms`)
			console.log(`  Economic yield: $${cumulativeValue.toFixed(2)}`)
			console.log(`  CO2 sequestered: ${cumulativeCO2.toFixed(2)}kg`)
		}
	}
	
	return simulationStats
}

function create_test_plot() {
	const plot = structuredClone(prototypical_plot)
	plot.id = 1
	plot.onreset({width:100,depth:100})
	return plot
}

// Run the simulation
function main() {
	console.log("Creating bamboo plot (100m x 100m)...")
	const plot = create_test_plot()
	
	const clumpCount = plot.children.length
	const totalCulms = clumpCount * prototypical_dendrocalamus_asper_clump.CULM_MAX
	
	console.log(`Plot initialized with ${clumpCount} clumps and ${totalCulms} culms`)
	console.log("\nRunning 10-year simulation...")
	
	const stats = runSimulation(plot, 10, 30)
	
	console.log("\nSimulation complete!")
	console.log(`Final statistics:`)
	console.log(`  Total culms harvested: ${stats.totalHarvest[stats.totalHarvest.length - 1]}`)
	console.log(`  Total economic yield: $${stats.economicYield[stats.economicYield.length - 1].toFixed(2)}`)
	console.log(`  Total CO2 sequestered: ${stats.co2Sequestered[stats.co2Sequestered.length - 1].toFixed(2)}kg`)
}

/*

accomplishments so far:

[done] so far we have a rough cut of a way to represent culms, clumps and plots
[done] we also initialize this

things we have to do still:

- we want s-curve growth of culm

- we need a concept of harvesting

- i want to run this simulation over a 10 year period; at some low resolution

- i want to log statistics at each step, the total growth, harvest, economic yield, co2

things to do later on:

- invent an idea of elevation that affects growth rate
- invent an idea of slope and slope facing that affects growth rate
- invent an idea of pests (just a field effect) that affects growth rate
- invent another organism, such as coffee, and try intercropping

*/



// Deep clone function that handles functions
function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') return obj;
	if (obj instanceof Date) return new Date(obj.getTime());
	if (obj instanceof Array) return obj.map(item => deepClone(item));
	
	const cloned = {};
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			cloned[key] = deepClone(obj[key]);
		}
	}
	
	// Copy functions and prototype methods
	const prototype = Object.getPrototypeOf(obj);
	if (prototype !== Object.prototype) {
		Object.setPrototypeOf(cloned, prototype);
	}
	
	return cloned;
}

// Basic prototypical entities share these properties

const prototypical_entity = {
	id: 0,
	xyz: [ 0,0,0 ],
	hwd: [ 0,0,0 ],
	ypr: [ 0,0,0 ],
	parent: 0,
	children: [],
	createdat: null,	
}

// A dendrocalamus asper culm prototype - clone to use

const prototypical_dendrocalamus_asper_culm = {

	...prototypical_entity,

	USD_PER_CULM: 12.0,
	CO2_KG_PER_CULM: 2.21
}

// A dendrocalamus asper clump prototype - clone to use

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

// A prototypical plot

const prototypical_plot = {
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
		const newCulm = deepClone(prototypical_dendrocalamus_asper_culm)
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
			console.log(`\nYear ${currentDay / 365}:`)
			console.log(`  Average culm height: ${(totalHeight / culmCount).toFixed(2)}m`)
			console.log(`  Total harvested: ${cumulativeHarvest} culms`)
			console.log(`  Economic yield: $${cumulativeValue.toFixed(2)}`)
			console.log(`  CO2 sequestered: ${cumulativeCO2.toFixed(2)}kg`)
			console.log(`  Harvest this year: ${stepHarvest} culms`)
		}
	}
	
	return simulationStats
}

function create_test_plot() {
	const plot = deepClone(prototypical_plot)
	plot.id = 1
	plot.onreset({width:100,depth:100})
	return plot
}

// Run the simulation
function main() {
	console.log("=== Bamboo Simulation Starting ===")
	console.log("Creating bamboo plot (100m x 100m)...")
	const startTime = performance.now()
	
	const plot = create_test_plot()
	
	const clumpCount = plot.children.length
	const totalCulms = clumpCount * prototypical_dendrocalamus_asper_clump.CULM_MAX
	
	console.log(`\nPlot initialized in ${((performance.now() - startTime) / 1000).toFixed(2)} seconds`)
	console.log(`  - ${clumpCount} clumps`)
	console.log(`  - ${totalCulms} total culms`)
	console.log(`  - Density: ${(clumpCount / (100 * 100 / 10000)).toFixed(2)} clumps per hectare`)
	
	console.log("\nRunning 10-year simulation...")
	console.log("(30-day time steps, logging annually)")
	
	const simStartTime = performance.now()
	const stats = runSimulation(plot, 10, 30)
	
	console.log(`\nSimulation completed in ${((performance.now() - simStartTime) / 1000).toFixed(2)} seconds`)
	console.log("\nFinal statistics:")
	console.log(`  Total culms harvested: ${stats.totalHarvest[stats.totalHarvest.length - 1]}`)
	console.log(`  Total economic yield: $${stats.economicYield[stats.economicYield.length - 1].toFixed(2)}`)
	console.log(`  Total CO2 sequestered: ${stats.co2Sequestered[stats.co2Sequestered.length - 1].toFixed(2)}kg`)
	console.log(`  Average yield per hectare: $${(stats.economicYield[stats.economicYield.length - 1] / (100 * 100 / 10000)).toFixed(2)}`)
}

// Run the simulation when the file is loaded
main()



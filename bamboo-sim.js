import { deepClone } from './utils/deepClone.js';
import { prototypical_plot } from './prototypes/plot.js';
import { prototypical_dendrocalamus_asper_clump } from './prototypes/clump.js';

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
	
	for (let step = 0; step < steps; step++) {
		const stepInfo = plot.onstep(daysPerStep)
		
		// Log progress every year
		if (stepInfo.currentDay % 365 === 0 && stepInfo.currentDay > 0) {
			console.log(`\nYear ${stepInfo.currentDay / 365}:`)
			console.log(`  Average culm height: ${stepInfo.avgHeight.toFixed(2)}m`)
			console.log(`  Total harvested: ${plot.cumulativeHarvest} culms`)
			console.log(`  Economic yield: $${plot.cumulativeValue.toFixed(2)}`)
			console.log(`  CO2 sequestered: ${plot.cumulativeCO2.toFixed(2)}kg`)
			console.log(`  Energy invested: ${(plot.cumulativeCostJoules / 1000000).toFixed(2)} MJ`)
			console.log(`  Cost invested: $${(plot.cumulativeCostJoules / 1000000 * plot.USD_PER_MEGAJOULE).toFixed(2)}`)
			console.log(`  Harvest this year: ${stepInfo.stepHarvest} culms`)
		}
	}
	
	return plot.simulationStats
}

// Run a simulation exercise

function main() {

	// starting
	console.log("=== Bamboo Simulation Starting ===")
	console.log("Creating bamboo plot (100m x 100m)...")
	const startTime = performance.now()

	// create a test plot
	const plot = deepClone(prototypical_plot)
	plot.id = 1
	plot.onreset({width:100,depth:100})

	// log a few details
	const clumpCount = plot.children.length
	const totalCulms = clumpCount * prototypical_dendrocalamus_asper_clump.CULM_MAX
	
	console.log(`\nPlot initialized in ${((performance.now() - startTime) / 1000).toFixed(2)} seconds`)
	console.log(`  - ${clumpCount} clumps`)
	console.log(`  - ${totalCulms} total culms`)
	console.log(`  - Density: ${(clumpCount / (100 * 100 / 10000)).toFixed(2)} clumps per hectare`)
	
	console.log("\nRunning 10-year simulation...")
	console.log("(30-day time steps, logging annually)")
	
	// run simulation
	const simStartTime = performance.now()
	const stats = runSimulation(plot, 10, 30)

	// log final stats
	console.log(`\nSimulation completed in ${((performance.now() - simStartTime) / 1000).toFixed(2)} seconds`)
	console.log("\nFinal statistics:")
	console.log(`  Total culms harvested: ${plot.cumulativeHarvest}`)
	console.log(`  Total economic yield: $${plot.cumulativeValue.toFixed(2)}`)
	console.log(`  Total CO2 sequestered: ${plot.cumulativeCO2.toFixed(2)}kg`)
	console.log(`  Total energy invested: ${(plot.cumulativeCostJoules / 1000000).toFixed(2)} MJ`)
	console.log(`  Total cost invested: $${(plot.cumulativeCostJoules / 1000000 * plot.USD_PER_MEGAJOULE).toFixed(2)}`)
	console.log(`  Average yield per hectare: $${(plot.cumulativeValue / (100 * 100 / 10000)).toFixed(2)}`)
	console.log(`  Net profit: $${(plot.cumulativeValue - (plot.cumulativeCostJoules / 1000000 * plot.USD_PER_MEGAJOULE)).toFixed(2)}`)
}

// Run the simulation when the file is loaded
main()



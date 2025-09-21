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



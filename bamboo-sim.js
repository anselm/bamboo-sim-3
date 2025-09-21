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
	
	// Print table header
	console.log("\n┌──────┬────────────┬────────────┬──────────────┬──────────────┬──────────────┬────────────┬──────────────┬──────────────┐")
	console.log("│ Year │ Bamboo Ht. │ Coffee Ht. │ Bamboo Harv. │ Coffee (kg)  │ Economic ($) │ CO2 (kg)   │ Energy(MJ)   │ Cost ($)     │")
	console.log("├──────┼────────────┼────────────┼──────────────┼──────────────┼──────────────┼────────────┼──────────────┼──────────────┤")
	
	let lastYearHarvest = 0
	let currentDay = 0
	let nextYearMark = 365
	
	while (currentDay < totalDays) {
		// Calculate days until next year mark or end of simulation
		const daysToStep = Math.min(daysPerStep, nextYearMark - currentDay, totalDays - currentDay)
		
		if (daysToStep > 0) {
			const stepInfo = plot.onstep(daysToStep)
			currentDay = stepInfo.currentDay
			
			// Check if we've reached a year mark
			if (currentDay >= nextYearMark && currentDay > 0) {
				const year = Math.floor(currentDay / 365)
				const yearlyBambooHarvest = plot.cumulativeHarvest - lastYearHarvest
				lastYearHarvest = plot.cumulativeHarvest
				
				// Get coffee harvest data
				let coffeeKg = 0
				plot.children.forEach(entity => {
					if (entity.metadata.title === 'Coffee Row') {
						coffeeKg += entity.totalHarvested
					}
				})
				
				console.log(`│ ${year.toString().padStart(4)} │ ${stepInfo.avgBambooHeight.toFixed(2).padStart(9)}m │ ${stepInfo.avgCoffeeHeight.toFixed(2).padStart(9)}m │ ${Math.round(yearlyBambooHarvest).toString().padStart(12)} │ ${coffeeKg.toFixed(1).padStart(12)} │ ${plot.cumulativeValue.toFixed(0).padStart(12)} │ ${plot.cumulativeCO2.toFixed(0).padStart(10)} │ ${(plot.cumulativeCostJoules / 1000000).toFixed(0).padStart(12)} │ ${(plot.cumulativeCostJoules / 1000000 * plot.USD_PER_MEGAJOULE).toFixed(0).padStart(12)} │`)
				
				nextYearMark += 365
			}
		} else {
			break
		}
	}
	
	console.log("└──────┴────────────┴────────────┴──────────────┴──────────────┴──────────────┴────────────┴──────────────┴──────────────┘")
	
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
	plot.ENABLE_INTERCROPPING = true  // Enable coffee intercropping
	plot.onreset({width:100,depth:100})

	// log a few details
	const clumpCount = plot.children.filter(c => c.metadata.title === 'Bamboo Clump').length
	const coffeeRowCount = plot.children.filter(c => c.metadata.title === 'Coffee Row').length
	const totalCulms = clumpCount * prototypical_dendrocalamus_asper_clump.CULM_MAX
	const totalCoffeePlants = coffeeRowCount * (plot.children.find(c => c.metadata.title === 'Coffee Row')?.PLANTS_PER_ROW || 0)
	
	console.log(`\nPlot initialized in ${((performance.now() - startTime) / 1000).toFixed(2)} seconds`)
	console.log(`  - ${clumpCount} bamboo clumps`)
	console.log(`  - ${totalCulms} total culms`)
	console.log(`  - ${coffeeRowCount} coffee rows`)
	console.log(`  - ${totalCoffeePlants} total coffee plants`)
	console.log(`  - Bamboo density: ${(clumpCount / (100 * 100 / 10000)).toFixed(2)} clumps per hectare`)
	
	console.log("\nRunning 20-year simulation...")
	console.log("(30-day time steps, logging annually)")
	
	// run simulation
	const simStartTime = performance.now()
	const stats = runSimulation(plot, 20, 30)

	// log final stats
	console.log(`\nSimulation completed in ${((performance.now() - simStartTime) / 1000).toFixed(2)} seconds`)
	console.log("\nFinal statistics:")
	console.log(`  Total culms harvested: ${Math.round(plot.cumulativeHarvest)}`)
	
	// Calculate coffee totals
	let totalCoffeeKg = 0
	let totalCoffeeValue = 0
	plot.children.forEach(entity => {
		if (entity.metadata.title === 'Coffee Row') {
			totalCoffeeKg += entity.totalHarvested
			totalCoffeeValue += entity.totalValue
		}
	})
	
	console.log(`  Total coffee harvested: ${totalCoffeeKg.toFixed(2)}kg`)
	console.log(`  Total economic yield: $${plot.cumulativeValue.toFixed(2)}`)
	console.log(`    - Bamboo: $${(plot.cumulativeValue - totalCoffeeValue).toFixed(2)}`)
	console.log(`    - Coffee: $${totalCoffeeValue.toFixed(2)}`)
	console.log(`  Total CO2 sequestered: ${plot.cumulativeCO2.toFixed(2)}kg`)
	console.log(`  Total energy invested: ${(plot.cumulativeCostJoules / 1000000).toFixed(2)} MJ`)
	console.log(`  Total cost invested: $${(plot.cumulativeCostJoules / 1000000 * plot.USD_PER_MEGAJOULE).toFixed(2)}`)
	console.log(`  Average yield per hectare: $${(plot.cumulativeValue / (100 * 100 / 10000)).toFixed(2)}`)
	console.log(`  Net profit: $${(plot.cumulativeValue - (plot.cumulativeCostJoules / 1000000 * plot.USD_PER_MEGAJOULE)).toFixed(2)}`)
}

// Run the simulation when the file is loaded
main()



# Bamboo Simulation

An agent-based model of a bamboo field using an ECS-like prototype pattern.

## How to run

npm i
npm run start

## Approach

1. A succinct ECS patterned, prototype based model of each agent, where I clone a prototype, and then run systems over clusters of related instances to do work.

2. A reasonable model of a dendrocalamus asper, or giant bamboo, which grows in clumps that are spaced to avoid overlap (clumps can be up to 12 meters wide), and where each clump has up to 40 individual poles (or culm as they are called). Growth of poles is on an s-curve, rapidly at first and slowing down towards old age. Harvesting of a clump starts at about 20% of that clump at about the 5 year mark. And each pole is worth about $12, and there is some estimate of co2 sequestration per pole, more mature clumps can sequester 2.24 kg per pole. There are usually 150 clumps per square hectare (a hectare is 10000 square meters).

3. Utter code clarity, easy to understand, clustering concepts in intuitive ways

## Accomplishments

- [x] Rough cut of a way to represent culms, clumps and plots
- [x] Initialize the simulation
- [x] S-curve growth of culm
- [x] Concept of harvesting
- [x] Run simulation over a 10 year period at low resolution
- [x] Log statistics at each step: total growth, harvest, economic yield, CO2
- [x] Coffee intercropping system with seasonal harvests
- [x] Separate tracking for bamboo and coffee yields

## Future Features

- Invent an idea of elevation that affects growth rate
- Invent an idea of slope and slope facing that affects growth rate
- Invent an idea of pests (just a field effect) that affects growth rate
- Model intercropping benefits (soil health, moisture retention, etc.)
- Add more intercrop options (ginger, turmeric, medicinal plants)

## Usage

### Command Line Version
```bash
node bamboo-sim.js
```

### Web 3D Version
```bash
# Serve the files with a local web server (required for ES6 modules)
python3 -m http.server 8000
# or
npx http-server -p 8000

# Then open in browser
open http://localhost:8000
```

The simulation creates a 100m x 100m plot. The CLI version runs for 20 years with daily time steps, logging statistics annually. The web version provides interactive 3D visualization with play/pause controls.

## Architecture

The simulation uses an event bus pattern via the `sys()` function which:
- Automatically calls `onreset()` on entities that have it
- Registers entities with `onstep()` methods for simulation updates
- Handles global stepping with `sys({step: days})` to advance all entities
- Provides a declarative way to initialize entities with their properties set first

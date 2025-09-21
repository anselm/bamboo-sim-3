# Bamboo Simulation

An agent-based model of a bamboo field using an ECS-like prototype pattern.

## How to run

npm i
npm run start

## Approach

1. A succinct ECS patterned, prototype based model of each agent, where I clone a prototype, and then run systems over clusters of related instances to do work.

2. A reasonable model of a dendrocalamus asper, or giant bamboo, which grows in clumps that are about 6 meters apart, and where each clump has up to 40 individual poles (or culm as they are called). Growth of poles is on an s-curve, rapidly at first and slowing down towards old age. Harvesting of a clump starts at about 20% of that clump at about the 5 year mark. And each pole is worth about $12, and there is some estimate of co2 sequestration per pole, more mature clumps can sequester 2.24 kg per pole. There are usually 150 clumps per square hectare (a hectare is 10000 square meters).

3. Utter code clarity, easy to understand, clustering concepts in intuitive ways

## Accomplishments

- [x] Rough cut of a way to represent culms, clumps and plots
- [x] Initialize the simulation
- [x] S-curve growth of culm
- [x] Concept of harvesting
- [x] Run simulation over a 10 year period at low resolution
- [x] Log statistics at each step: total growth, harvest, economic yield, CO2

## Future Features

- Invent an idea of elevation that affects growth rate
- Invent an idea of slope and slope facing that affects growth rate
- Invent an idea of pests (just a field effect) that affects growth rate
- Invent another organism, such as coffee, and try intercropping

## Usage

```bash
node bamboo-sim.js
```

The simulation creates a 100m x 100m plot and runs for 10 years, logging statistics annually.

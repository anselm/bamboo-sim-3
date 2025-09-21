# Bamboo Simulation

## Overview

Sep 20 2025

Basic goals:

Farmers, funders and other stakeholders all live in a very real world. We need to survive, grow, protect our families. But we also live in a world of stories and myth; within larger narratives, about the history of the actual piece of land we are standing on, the planet we care about, the outcomes we want.

Can any of us go to a piece of land, scan it with our phones, have an application connect us to the gps based history of that piece of land, the story, its ecological past, present and potential future?

Farmers themselves can benefit from tools that help them understand downstream impacts of their farming behavior. Funders need to understand local outcomes, but often lack local understanding. In a sense coordination as a whole means bridging stories; finding ways to build shared understanding.

The overall goal is to find a 'coordination layer' or a way for farmers and funders to have a shared understanding, rough alignment, on direction and outcomes.

## What are the challenges for farmers and funders?

- our primary communication tools today are largely language and rhetoric; a pitch can be backed by some evidence, but the evidence isn't as rigorous as it could be.

- farmers often struggle to get funding for clear opportunities that they see on the ground; it can be hard to communicate local understanding

- there are all kinds of different costs to benefit analysis on planting bamboo; there are many choices and, there can be interventions, such as fertilizers or intercropping, and harvesting schedules, and there are fundamentals such as different soil conditions, sun facing slopes versus not, water drainage, precipitation predictions, pests and so on.

- funders often lack a clear picture; it can be hard to prove a 'counter factual' that if an intervention did take place (such as a choice to farm a new area) that it would change outcomes from what is currently observable. farmers also often don't speak in the same way as the funder; funders tend to be risk averse as well.

- farming as a whole interesects with an unpredictable and wild nature; agroforestry in the larger sense is a complex and turbulent science, similar to weather prediction; and often is over-simplified; modeling whole system outcomes has often felt to be too challenging; or too costly.

## What kinds of information do we need to share to help with coordination?

- deep time -> an understanding of a piece of land, its deep history, is it wild, is it farmland, was it harvested recently, the social, political, economic, geological and indigenous story of that piece of land.

- the western canon -> western science, and a legacy of the work of thousands of phds, does have some understanding of how different species grow, environmental impacts, and different measures outcome, from pragmatic revenue, to co2 capture, to measures of long term biodiversity and overall ecosystem health, including local community health.

- local current knowledge -> often having a truly in depth understanding of local conditions, micro-climates, local or regional politics, other factors that can hugely vary results - and there's often a risk that decisions made from afar simply don't understand regional variation or regional issues and act blindly without local guidance

- whole system predictive models -> new tools can bridge both local understanding and formal understanding. Tools that can show a shared representation of local issues could help connect funding to local projects, and can help as a coordination layer between many stakeholders - who ultimately do have shared goals.

- models of individual organisms -> the behavior of each different species of bamboo, other crops, pests, and organisms, over time, with relationship to each other and environmental conditions such as elevation, slope, rain and other natural phenomena

- bioregional boundary information -> bioregional databases (there are many of these online showing ideal growing zones for different things such as rice versus coffee and so on). One example of this is the https://www.oneearth.org/bioregions-2023/ biome boundary dataset; but there are many regional datasets that are much more precise. Farmers often have local understanding, but these datasets can help digital models make predictions about what will grow where.

- hydrography -> digital models can also benefit from understanding water availability

- local species databases

- migration corridors and other phenomena that may have unexpected impacts, or that may be critical to protect (effectively part of any scoring)

- sensor data: temperature, humidity, soil conditions, irradiation, co2

- field-logs: photographs, direct reports of the health of plants; for example reporting on mold, mildew or pests, plant height

- google earth alpha; a new tool providing a novel high-dimensional 'number' per point in space that provides information about that point in space; useful for finding all areas that have similar growing conditions for example; quite useful.

## Visualization and Communication

- dashboards -> farmers are not technical, they have very specific needs; they need to see a quick health overview, effectively a dashboard, and they need to be able to register plots, potential plots, sensor readings and reports

- simulation interface -> in general any user needs an ability to project outcomes - to 'see' future agroforestry impacts; for example to see bamboo successional growth patterns and expected changes, with multiple species interactions over 5, 10+ years based on different initial conditions

- side-by-side -> being able to do side-by-side comparisons with different initial conditions, different plantings, harvesting schedules, interventions, and environmental conditions

## Fundamental Technical Approaches to modeling

- postgis is commonly used for managing raw spatial data with reasonably rapid query support. note that large scale simulations of even a few hundred hectares tend to require millions of queries, so it's not useful to directly tie them to postgis, but postgis can be a durable storage, and simulators can inhale that state into memory for short term modeling.

- cellular automata can be used to do rapid and coarse grained simulations of phenomena in a given area

## References and Resources

Excellent Agroforestry individual tree modeling based model -> https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2019EA000748

Excellent detail on modeling environmental and economic agroforestry -> https://www.frontiersin.org/journals/ecology-and-evolution/articles/10.3389/fevo.2022.845435/full

Reasonable review of agent based models -> https://smythos.com/developers/agent-development/agent-based-modeling-frameworks/


Co2 -> https://innspub.net/carbon-stock-assessment-of-bamboo-plantations-in-northern-mindanao-philippines/

ESA Biomass -> https://www.esa.int/Applications/Observing_the_Earth/FutureEO/Biomass

Clay -> https://clay-foundation.github.io/model/getting-started/installation.html https://www.youtube.com/watch?v=gFjbrGaAL6w https://github.com/Clay-foundation/model

Legend -> https://lgnd.io/ , https://www.linkedin.com/in/dan-hammer/ , https://www.linkedin.com/in/nasonurb/

BRUNO SANCHEZ ANDRADE NUNO

ImpactScience -> https://book.impactscience.dev/book/Foreword.html

TerraMind -> Multimodal Foundational Model for Earth Observation https://arxiv.org/abs/2504.11171 https://github.com/IBM/terramind

IBM/ ESA -> https://huggingface.co/ibm-esa-geospatial

Microsoft Planetary Computer -> https://planetarycomputer.microsoft.com/explore?c=121.9432%2C11.3570&z=6.22&v=2&d=io-biodiversity&m=2020&r=Biodiversity+Intactness&s=false%3A%3A100%3A%3Atrue&sr=desc&ae=0

EarthGenome -> https://www.earthgenome.org/

ClimateTrace -> https://www.climatetrace.org/

bioregion data -> https://www.oneearth.org/bioregions-2023/

replit test -> https://replit.com/@amberinitiative/TerraTwin01

## Bamboo Basic Factors

- Giant Bamboo, Dendrocalamus asper
- S based growth curve
	- Initial plant height is 0.5m in year 1
	- Growth to reach ~10m by year 2
	- 25m height by year 3
	- 25 m by year 3
- Total carbon stock: 234.46 tonnes C/ha (equivalent to 860 tonnes CO2e/ha)
- D. asper aboveground carbon: 87.52 tonnes carbon/ha
- Annual carbon sequestration rate: 23.84 tonnes C/ha/year (87.5 tonnes CO2/ha/year

- Harvest 20% after year 5 of poles in one clump
- $12 per pole
- 150 clumps per hectare
- 6m spacing
- Pole tilt; 5 %

## Technical goals

- agent based
- fast spatial indexing
- extensible
- easy to understand

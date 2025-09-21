import { deepClone } from '../utils/deepClone.js';
import { sys } from '../utils/sys.js';
import { prototypical_plot } from '../prototypes/plot.js';
import { volume_service } from '../services/volume.js';
import { StatsCanvas } from './stats-canvas.js';

export class BambooSimApp {
    constructor() {
        this.plot = null;
        this.isRunning = false;
        this.currentDay = 0;
        this.animationId = null;
        this.statsCanvas = null;
        this.activeTab = '3d';
        
        this.initializeUI();
        this.bindEvents();
    }
    
    initializeUI() {
        // Set active tab
        document.querySelector('[data-tab="3d"]').classList.add('active');
        document.querySelector('[data-content="3d"]').classList.remove('hidden');
    }
    
    bindEvents() {
        // Tab switching
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stepBtn').addEventListener('click', () => this.step(1));
        document.getElementById('yearBtn').addEventListener('click', () => this.step(365));
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        // Speed control
        document.getElementById('speedControl').addEventListener('input', (e) => {
            document.getElementById('speedValue').textContent = e.target.value + 'x';
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('[data-content]').forEach(content => {
            content.classList.add('hidden');
        });
        document.querySelector(`[data-content="${tabName}"]`).classList.remove('hidden');
        
        this.activeTab = tabName;
        
        // Initialize stats canvas if switching to stats tab
        if (tabName === 'stats' && !this.statsCanvas) {
            this.statsCanvas = new StatsCanvas('statsCanvas');
        }
    }
    
    initializePlot() {
        // Initialize volume service first
        sys(volume_service);
        
        // Create plot
        this.plot = deepClone(prototypical_plot);
        this.plot.id = 1;
        this.plot.field.width = 100;
        this.plot.field.depth = 100;
        this.plot.field.ENABLE_INTERCROPPING = true;
        
        // Register plot with sys
        sys(this.plot);
        
        // Send all entities through sys so volume service can see them
        this.updateAllEntities();
        this.updateStats();
    }
    
    updateAllEntities() {
        // Send volume update events for rendering
        // We need a way to update the volume service without triggering onreset
        // For now, we'll create a special update event
        const updateEvent = { 
            volumeUpdate: true,
            entity: this.plot 
        };
        sys(updateEvent);
        
        // Update all children
        this.plot.children.forEach(entity => {
            sys({ volumeUpdate: true, entity: entity });
            
            // Update grandchildren (culms, coffee plants)
            if (entity.children) {
                entity.children.forEach(child => {
                    sys({ volumeUpdate: true, entity: child });
                });
            }
        });
    }
    
    updateStats() {
        let totalBambooHeight = 0;
        let culmCount = 0;
        let totalCoffeeHeight = 0;
        let coffeePlantCount = 0;
        
        this.plot.children.forEach(entity => {
            if (entity.clump) {
                entity.children.forEach(culm => {
                    totalBambooHeight += culm.volume.hwd[0];
                    culmCount++;
                });
            } else if (entity.coffeerow) {
                entity.children.forEach(plant => {
                    totalCoffeeHeight += plant.volume.hwd[0];
                    coffeePlantCount++;
                });
            }
        });
        
        const avgBambooHeight = culmCount > 0 ? totalBambooHeight / culmCount : 0;
        const avgCoffeeHeight = coffeePlantCount > 0 ? totalCoffeeHeight / coffeePlantCount : 0;
        
        // Update UI
        document.getElementById('day').textContent = this.currentDay;
        document.getElementById('year').textContent = Math.floor(this.currentDay / 365);
        document.getElementById('bambooHeight').textContent = avgBambooHeight.toFixed(2) + 'm';
        document.getElementById('coffeeHeight').textContent = avgCoffeeHeight.toFixed(2) + 'm';
        document.getElementById('harvested').textContent = Math.round(this.plot.stats.cumulativeHarvest);
        document.getElementById('value').textContent = '$' + this.plot.stats.cumulativeValue.toFixed(2);
        
        // Update stats canvas if active
        if (this.statsCanvas && this.activeTab === 'stats') {
            this.statsCanvas.update(this.plot.stats, this.currentDay);
        }
    }
    
    simulationStep(days = 1) {
        for (let i = 0; i < days; i++) {
            sys({step: 1});
            this.currentDay++;
            
            // Update plot statistics
            this.plot.onstep(1);
        }
        
        this.updateAllEntities();
        this.updateStats();
    }
    
    animate() {
        if (this.isRunning) {
            const speed = parseInt(document.getElementById('speedControl').value);
            this.simulationStep(speed);
            this.animationId = setTimeout(() => this.animate(), 100);
        }
    }
    
    start() {
        if (!this.plot) {
            this.initializePlot();
        }
        this.isRunning = true;
        this.animate();
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
        }
    }
    
    step(days) {
        if (!this.plot) {
            this.initializePlot();
        }
        this.simulationStep(days);
    }
    
    reset() {
        this.pause();
        this.currentDay = 0;
        this.plot = null;
        
        // Clear volume service meshes
        if (volume_service.meshes) {
            volume_service.meshes.forEach(mesh => {
                volume_service.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            });
            volume_service.meshes.clear();
        }
        
        this.updateStats();
    }
}

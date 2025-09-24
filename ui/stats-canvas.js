export class StatsCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    update(stats, currentDay) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        
        if (!stats.days || stats.days.length === 0) return;
        
        // Calculate yearly data from daily stats
        const yearlyData = this.calculateYearlyData(stats);
        
        // Draw main chart area
        const chartTop = 40;
        const chartBottom = height - 180; // Leave space for legend
        const chartHeight = chartBottom - chartTop;
        const chartLeft = 60;
        const chartRight = width - 40;
        const chartWidth = chartRight - chartLeft;
        
        // Draw grid and axes
        this.drawGrid(chartLeft, chartTop, chartWidth, chartHeight);
        
        // Define metrics to plot
        const metrics = [
            { data: yearlyData.bambooHeight, color: '#22c55e', label: 'Bamboo Height (m)', scale: 1 },
            { data: yearlyData.coffeeHeight, color: '#a855f7', label: 'Coffee Height (m)', scale: 10 }, // Scale up for visibility
            { data: yearlyData.bambooHarvested, color: '#f59e0b', label: 'Bamboo Harvested/yr', scale: 0.1 },
            { data: yearlyData.coffeeHarvested, color: '#ec4899', label: 'Coffee kg/yr', scale: 0.1 },
            { data: yearlyData.netIncome, color: '#3b82f6', label: 'Net Income ($)', scale: 0.001 },
            { data: yearlyData.totalIncome, color: '#10b981', label: 'Total Income ($)', scale: 0.001 },
            { data: yearlyData.totalCost, color: '#ef4444', label: 'Total Cost ($)', scale: 0.001 },
            { data: yearlyData.co2, color: '#6366f1', label: 'CO2 Sequestered (kg)', scale: 0.0001 }
        ];
        
        // Find max value for scaling
        let maxValue = 0;
        metrics.forEach(metric => {
            metric.data.forEach(value => {
                maxValue = Math.max(maxValue, value * metric.scale);
            });
        });
        
        // Draw all metrics
        metrics.forEach(metric => {
            this.drawMetric(
                metric.data, 
                chartLeft, 
                chartTop, 
                chartWidth, 
                chartHeight, 
                metric.color, 
                metric.scale,
                maxValue
            );
        });
        
        // Draw axes labels
        this.drawAxes(chartLeft, chartTop, chartWidth, chartHeight, yearlyData.years, maxValue);
        
        // Draw legend
        this.drawLegend(metrics, chartLeft, chartBottom + 40);
        
        // Draw summary text
        this.drawSummary(yearlyData, chartLeft, chartBottom + 120);
        
        // Draw current year indicator
        if (currentDay > 0) {
            const currentYear = currentDay / 365;
            const x = chartLeft + (currentYear / 20) * chartWidth; // Assuming 20 year simulation
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, chartTop);
            ctx.lineTo(x, chartBottom);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    calculateYearlyData(stats) {
        const yearlyData = {
            years: [],
            bambooHeight: [],
            coffeeHeight: [],
            bambooHarvested: [],
            coffeeHarvested: [],
            totalIncome: [],
            totalCost: [],
            netIncome: [],
            co2: []
        };
        
        let lastYearIndex = 0;
        let lastHarvest = 0;
        let lastCO2 = 0;
        let lastValue = 0;
        let lastCost = 0;
        let lastCoffeeKg = 0;
        
        // Process daily data into yearly summaries
        for (let i = 0; i < stats.days.length; i++) {
            const day = stats.days[i];
            const year = Math.floor(day / 365);
            
            // Check if we've completed a year
            if (year > yearlyData.years.length || i === stats.days.length - 1) {
                // Calculate yearly values
                const yearHarvest = stats.totalHarvest[i] - lastHarvest;
                const yearCO2 = stats.co2Sequestered[i] - lastCO2;
                const yearValue = stats.economicYield[i] - lastValue;
                const yearCost = (stats.energyCostJoules[i] - lastCost) / 1000000 * 0.0278; // Convert to $
                const yearCoffeeKg = (stats.coffeeHarvested ? stats.coffeeHarvested[i] : 0) - lastCoffeeKg;
                
                yearlyData.years.push(year);
                yearlyData.bambooHeight.push(stats.totalGrowth[i]);
                yearlyData.coffeeHeight.push(stats.coffeeHeight ? stats.coffeeHeight[i] : 0);
                yearlyData.bambooHarvested.push(yearHarvest);
                yearlyData.coffeeHarvested.push(yearCoffeeKg);
                yearlyData.totalIncome.push(stats.economicYield[i]);
                yearlyData.totalCost.push(stats.energyCostJoules[i] / 1000000 * 0.0278);
                yearlyData.netIncome.push(stats.economicYield[i] - (stats.energyCostJoules[i] / 1000000 * 0.0278));
                yearlyData.co2.push(stats.co2Sequestered[i]);
                
                lastHarvest = stats.totalHarvest[i];
                lastCO2 = stats.co2Sequestered[i];
                lastValue = stats.economicYield[i];
                lastCost = stats.energyCostJoules[i];
                lastCoffeeKg = stats.coffeeHarvested ? stats.coffeeHarvested[i] : 0;
            }
        }
        
        return yearlyData;
    }
    
    drawMetric(data, x, y, width, height, color, scale, maxValue) {
        const ctx = this.ctx;
        
        if (!data || data.length === 0) return;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const px = x + (i / (data.length - 1)) * width;
            const scaledValue = data[i] * scale;
            const py = y + height - (scaledValue / maxValue) * height;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
    }
    
    drawGrid(x, y, width, height) {
        const ctx = this.ctx;
        
        // Background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, y, width, height);
        
        // Grid lines
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const py = y + (i / 5) * height;
            ctx.beginPath();
            ctx.moveTo(x, py);
            ctx.lineTo(x + width, py);
            ctx.stroke();
        }
        
        // Vertical lines (years)
        for (let i = 0; i <= 20; i++) {
            const px = x + (i / 20) * width;
            ctx.beginPath();
            ctx.moveTo(px, y);
            ctx.lineTo(px, y + height);
            ctx.stroke();
        }
    }
    
    drawAxes(x, y, width, height, years, maxValue) {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#888';
        ctx.font = '12px sans-serif';
        
        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = (maxValue * (5 - i) / 5);
            const py = y + (i / 5) * height;
            ctx.fillText(value.toFixed(0), x - 40, py + 4);
        }
        
        // X-axis labels (years)
        for (let i = 0; i <= 20; i += 5) {
            const px = x + (i / 20) * width;
            ctx.fillText(i.toString(), px - 10, y + height + 20);
        }
        
        // Axis labels
        ctx.font = '14px sans-serif';
        ctx.fillText('Years', x + width / 2 - 20, y + height + 40);
        
        // Rotated Y-axis label
        ctx.save();
        ctx.translate(x - 50, y + height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Normalized Scale', -40, 0);
        ctx.restore();
    }
    
    drawLegend(metrics, x, y) {
        const ctx = this.ctx;
        const columnWidth = 200;
        const rowHeight = 20;
        
        ctx.font = '12px sans-serif';
        
        metrics.forEach((metric, i) => {
            const col = Math.floor(i / 4);
            const row = i % 4;
            const px = x + col * columnWidth;
            const py = y + row * rowHeight;
            
            // Color box
            ctx.fillStyle = metric.color;
            ctx.fillRect(px, py - 10, 15, 15);
            
            // Label
            ctx.fillStyle = '#ccc';
            ctx.fillText(metric.label, px + 20, py);
        });
    }
    
    drawSummary(yearlyData, x, y) {
        const ctx = this.ctx;
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#999';
        
        const lastIndex = yearlyData.years.length - 1;
        if (lastIndex >= 0) {
            const summary = `Year ${yearlyData.years[lastIndex]}: ` +
                `Net Income: $${yearlyData.netIncome[lastIndex].toFixed(0)} | ` +
                `Total Revenue: $${yearlyData.totalIncome[lastIndex].toFixed(0)} | ` +
                `Total Cost: $${yearlyData.totalCost[lastIndex].toFixed(0)} | ` +
                `CO2: ${yearlyData.co2[lastIndex].toFixed(0)}kg`;
            
            ctx.fillText(summary, x, y);
        }
        
        ctx.fillText('All metrics normalized to fit on single scale. Actual values shown in legend.', x, y + 15);
    }
}

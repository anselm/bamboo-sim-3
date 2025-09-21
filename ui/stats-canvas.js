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
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        if (!stats.days || stats.days.length === 0) return;
        
        // Draw charts
        const charts = [
            { data: stats.totalGrowth, color: '#22c55e', label: 'Avg Height (m)' },
            { data: stats.economicYield, color: '#3b82f6', label: 'Economic Value ($)', scale: 0.001 },
            { data: stats.co2Sequestered, color: '#a855f7', label: 'CO2 (kg)', scale: 0.01 }
        ];
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = (height - padding * 3) / charts.length;
        
        charts.forEach((chart, index) => {
            const yOffset = padding + index * (chartHeight + padding);
            this.drawChart(
                chart.data,
                padding,
                yOffset,
                chartWidth,
                chartHeight,
                chart.color,
                chart.label,
                chart.scale || 1
            );
        });
    }
    
    drawChart(data, x, y, width, height, color, label, scale = 1) {
        const ctx = this.ctx;
        
        if (!data || data.length === 0) return;
        
        // Find min/max
        const values = data.map(d => d * scale);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue || 1;
        
        // Draw label
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText(label, x, y - 5);
        
        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        
        // Draw data
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((value, i) => {
            const px = x + (i / (data.length - 1)) * width;
            const py = y + height - ((value * scale - minValue) / range) * height;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        });
        
        ctx.stroke();
        
        // Draw value labels
        ctx.fillStyle = '#999';
        ctx.font = '10px sans-serif';
        ctx.fillText(maxValue.toFixed(1), x - 30, y + 10);
        ctx.fillText(minValue.toFixed(1), x - 30, y + height);
    }
}

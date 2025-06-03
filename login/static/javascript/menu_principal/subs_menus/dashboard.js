// dashboard.js - Versión definitiva sin errores de canvas
class DashboardChartManager {
    constructor() {
        this.chart = null;
        this.currentYear = new Date().getFullYear();
        this.chartCanvas = document.getElementById('payrollChart');
        this.init();
    }

    async init() {
        try {
            const yearSelector = document.getElementById('year-selector');
            if (yearSelector) {
                this.currentYear = yearSelector.value;
                yearSelector.addEventListener('change', (e) => {
                    this.currentYear = e.target.value;
                    this.loadChartData();
                });
            }
            await this.loadChartData();
        } catch (error) {
            console.error('Error al inicializar el dashboard:', error);
            this.showError('Error al inicializar el gráfico');
        }
    }

    async loadChartData() {
        try {
            this.showLoading(true);
            const response = await fetch(`/api/nominas/chart-data/?year=${this.currentYear}`);
            
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            this.updateChart(data);
            this.updateSummary(data);
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.showError('Error al cargar los datos. Intente nuevamente.');
        } finally {
            this.showLoading(false);
        }
    }

    updateChart(data) {
        try {
            // Verificar si el canvas existe
            if (!this.chartCanvas) {
                console.error('Canvas no encontrado');
                return;
            }

            // Resetear completamente el canvas
            this.resetCanvas();

            // Destruir el gráfico anterior si existe
            this.destroyChart();

            // Crear nuevo contexto y gráfico
            const ctx = this.chartCanvas.getContext('2d');
            
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.meses,
                    datasets: [{
                        label: `Gastos en Nóminas ${data.year}`,
                        data: data.datos,
                        backgroundColor: 'rgba(78, 115, 223, 0.5)',
                        borderColor: 'rgba(78, 115, 223, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'Bs. ' + value.toLocaleString('es-VE');
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Bs. ' + context.raw.toLocaleString('es-VE');
                                }
                            }
                        }
                    }
                }
            });
            
            const yearDisplay = document.getElementById('chart-year-display');
            if (yearDisplay) yearDisplay.textContent = `Total año ${data.year}`;
            
        } catch (error) {
            console.error('Error al actualizar el gráfico:', error);
            this.showError('Error al mostrar el gráfico');
            // Forzar limpieza del canvas si hay error
            this.resetCanvas();
        }
    }

    resetCanvas() {
        if (this.chartCanvas) {
            // Esta es la solución clave - resetear completamente el canvas
            this.chartCanvas.width = this.chartCanvas.width;
        }
    }

    destroyChart() {
        if (this.chart) {
            try {
                this.chart.destroy();
            } catch (destroyError) {
                console.warn('Error al destruir gráfico anterior:', destroyError);
            }
            this.chart = null;
        }
    }

    updateSummary(data) {
        const summaryElement = document.getElementById('chart-summary-text');
        if (!summaryElement) return;
        
        const totalNominas = data.total_nominas || 0;
        const totalGastado = data.datos.reduce((a, b) => a + b, 0);
        
        // Actualizar el resumen del gráfico
        summaryElement.innerHTML = `
            Total de Nóminas en ${data.year}: <strong>${totalNominas} nóminas</strong><br>
            Total gastado: <strong>Bs. ${totalGastado.toLocaleString('es-VE', {minimumFractionDigits: 2})}</strong>
        `;
        
        // Actualizar el panel del total general
        const totalValueElement = document.getElementById('total-year-value');
        const totalYearElement = document.getElementById('total-year-text');
        
        if (totalValueElement) {
            totalValueElement.textContent = `Bs.${totalGastado.toLocaleString('es-VE', {minimumFractionDigits: 2})}`;
        }
        
        if (totalYearElement) {
            totalYearElement.textContent = `Total año ${data.year}`;
        }
    }

    showLoading(show) {
        const loadingElement = document.getElementById('chart-loading');
        const chartElement = document.getElementById('payrollChart');
        
        if (loadingElement) loadingElement.style.display = show ? 'block' : 'none';
        if (chartElement) chartElement.style.display = show ? 'none' : 'block';
    }

    showError(message) {
        const container = document.querySelector('.chart-container');
        if (!container) return;
        
        const existingError = container.querySelector('.chart-error');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chart-error alert alert-danger';
        errorDiv.innerHTML = `<p>${message}</p>`;
        container.prepend(errorDiv);
    }

    // Limpieza completa
    destroy() {
        this.destroyChart();
        this.resetCanvas();
    }
}

// Inicialización mejorada
window.initializeDashboard = function() {
    try {
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js no está cargado');
        }
        
        // Limpiar instancia anterior
        if (window.dashboardChartManager) {
            window.dashboardChartManager.destroy();
            window.dashboardChartManager = null;
        }
        
        // Crear nueva instancia
        window.dashboardChartManager = new DashboardChartManager();
        return true;
    } catch (error) {
        console.error('Error en initializeDashboard:', error);
        const container = document.querySelector('.chart-container');
        if (container) {
            container.innerHTML = '<div class="alert alert-danger">Error al cargar el gráfico. Recargue la página.</div>';
        }
        return false;
    }
};

// Inicialización automática segura
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('payrollChart')) {
        const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                clearInterval(checkChart);
                window.initializeDashboard();
            }
        }, 100);
    }
});
// dashboard.js - Versión corregida
console.log()
class DashboardChartManager {
    constructor() {
        this.chart = null;
        this.currentYear = new Date().getFullYear();
        this.init();
    }

    async init() {
        try {
            // Obtener el año inicial del selector
            const yearSelector = document.getElementById('year-selector');
            if (yearSelector) {
                this.currentYear = yearSelector.value;
                
                // Configurar evento para el selector de año
                yearSelector.addEventListener('change', (e) => {
                    this.currentYear = e.target.value;
                    this.loadChartData();
                });
            }

            // Cargar datos iniciales
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
        const canvas = document.getElementById('payrollChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.chart) this.chart.destroy();
        
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
    }

    updateSummary(data) {
        const summaryElement = document.getElementById('chart-summary-text');
        if (!summaryElement) return;
        
        const totalNominas = data.total_nominas || 0;
        const totalGastado = data.datos.reduce((a, b) => a + b, 0);
        
        summaryElement.innerHTML = `
            Total de Nóminas en ${data.year}: <strong>${totalNominas} nóminas</strong><br>
            Total gastado: <strong>Bs. ${totalGastado.toLocaleString('es-VE', {minimumFractionDigits: 2})}</strong>
        `;
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
        errorDiv.className = 'chart-error';
        errorDiv.innerHTML = `<p>${message}</p>`;
        container.prepend(errorDiv);
    }
}

// Función global para inicialización
window.initializeDashboard = function() {
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está cargado');
        return false;
    }
    
    // Limpiar instancia anterior si existe
    if (window.dashboardChartManager) {
        try {
            if (window.dashboardChartManager.chart) {
                window.dashboardChartManager.chart.destroy();
            }
        } catch (e) {
            console.error('Error al limpiar gráfico anterior:', e);
        }
    }
    
    // Crear nueva instancia
    window.dashboardChartManager = new DashboardChartManager();
    return true;
};

// Inicialización automática si el gráfico está en la página
if (document.getElementById('payrollChart')) {
    // Esperar a que Chart.js esté disponible
    const checkChart = setInterval(() => {
        if (typeof Chart !== 'undefined') {
            clearInterval(checkChart);
            window.initializeDashboard();
        }
    }, 100);
}
document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'recibo_pago.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de recibo_pago cargado');
        // Aquí puedes añadir la lógica específica para el perfil
    }
});

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'recibo_pago.html') {
        // Limpiar event listeners o recursos
        console.log('Panel de recibo_pago descargado');
    }
});
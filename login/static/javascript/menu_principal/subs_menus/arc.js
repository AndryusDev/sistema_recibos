document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'arc.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de arc cargado');
        // Aquí puedes añadir la lógica específica para el perfil
    }
});

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'arc.html') {
        // Limpiar event listeners o recursos
        console.log('Panel de arc descargado');
    }
});
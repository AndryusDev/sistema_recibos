document.addEventListener('templateLoaded', function(e) {
    if (e.detail.template === 'constancia_trabajo.html') {
        // Inicializar componentes específicos del perfil
        console.log('Panel de constancia de trabajo cargado');
        // Aquí puedes añadir la lógica específica para el perfil
    }
});

document.addEventListener('templateUnloading', function(e) {
    if (e.detail.template === 'constancia_trabajo.html') {
        // Limpiar event listeners o recursos
        console.log('Panel de constancia de trabajo descargado');
    }
});
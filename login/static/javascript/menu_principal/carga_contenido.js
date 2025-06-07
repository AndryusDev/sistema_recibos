document.addEventListener('DOMContentLoaded', function() {
    // Cargar el dashboard inicial si es la página principal
    if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
        loadDashboardContent();
    }

    document.querySelectorAll('.OpcMenu').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const template = this.getAttribute('data-template');
            
            if (template === "dashboard.html") {
                loadDashboardContent();
            } else {
                loadRegularTemplate(template);
            }
        });
    });
});

// Función para cargar templates regulares
function loadRegularTemplate(templateName) {
    const templateUrls = {
        "importar_nomina.html": "/importar_nomina",
        "perfil_usuario.html": "/perfil_usuario",
        "recibos_pagos.html": "/recibos_pagos",
        "constancia_trabajo.html": "/constancia_trabajo/",
        "arc.html": "/arc/",
        "noticias.html": "/noticias/",
        "ver_prenomina.html": "/ver_prenomina",
        "crear_usuarios.html": "/crear_usuarios"
    };

    const url = templateUrls[templateName];
    if (!url) return;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar el contenido");
            return response.text();
        })
        .then(html => {
            const container = document.getElementById('contenido-dinamico');
            container.innerHTML = html;
            loadTemplateScripts(templateName);
        })
        .catch(error => {
            console.error(error);
            document.getElementById('contenido-dinamico').innerHTML = 
                `<p class="error">Error al cargar contenido: ${error.message}</p>`;
        });
}

// Función especial para cargar el dashboard
function loadDashboardContent() {
    fetch('/dashboard')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('contenido-dinamico');
            container.innerHTML = html;
            
            // Cargar dependencias en orden
            loadChartJs()
                .then(() => loadDashboardJs())
                .then(() => {
                    if (window.initializeDashboard) {
                        // Esperar a que los elementos del dashboard estén listos
                        setTimeout(() => {
                            initializeDashboard();
                        }, 300);
                    }
                })
                .catch(error => {
                    console.error("Error cargando dependencias:", error);
                });
        });
}

// Función para cargar scripts específicos
function loadTemplateScripts(templateName) {
    const templateScripts = {
        "importar_nomina.html": "/static/javascript/menu_principal/subs_menus/importar_nomina.js",
        "crear_usuarios.html": "/static/javascript/menu_principal/subs_menus/crear_usuarios.js"
    };

    if (templateScripts[templateName]) {
        const scriptUrl = templateScripts[templateName];
        const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
        
        if (!existingScript) {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = scriptUrl;
                script.onload = () => {
                    setTimeout(() => {
                        if (templateName === "importar_nomina.html" && window.initializeImportarNomina) {
                            initializeImportarNomina();
                            if (window.aplicarFiltros) aplicarFiltros();
                        }
                        if (templateName === "crear_usuarios.html") {
                            if (window.inicializarEventosEmpleados) inicializarEventosEmpleados();
                            if (window.aplicarFiltrosEmpleados) aplicarFiltrosEmpleados();
                        }
                        resolve();
                    }, 300); // Aumentar el tiempo de espera
                };
                script.onerror = () => {
                    console.error(`Error al cargar el script: ${scriptUrl}`);
                    resolve();
                };
                document.head.appendChild(script);
            });
        } else {
            // Si el script ya está cargado, ejecutar las funciones directamente
            setTimeout(() => {
                if (templateName === "importar_nomina.html" && window.initializeImportarNomina) {
                    initializeImportarNomina();
                    if (window.aplicarFiltros) aplicarFiltros();
                }
                if (templateName === "crear_usuarios.html") {
                    if (window.inicializarEventosEmpleados) inicializarEventosEmpleados();
                    if (window.aplicarFiltrosEmpleados) aplicarFiltrosEmpleados();
                }
            }, 100);
            return Promise.resolve();
        }
    }
    return Promise.resolve();
}

// Funciones para cargar Chart.js y Dashboard.js (mantén las originales)
function loadChartJs() {
    return new Promise((resolve) => {
        if (typeof Chart !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

function loadDashboardJs() {
    return new Promise((resolve) => {
        if (typeof DashboardChartManager !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = '/static/javascript/menu_principal/subs_menus/dashboard.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
}
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
        "crear_usuarios.html": "/crear_usuarios",
        "roles_usuarios.html": "/roles_usuarios"
    };

    const url = templateUrls[templateName];
    if (!url) return;

    // Mostrar estado de carga
    const container = document.getElementById('contenido-dinamico');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Cargando contenido...</div>';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Error ${response.status} al cargar ${templateName}`);
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            return loadTemplateScripts(templateName);
        })
        .catch(error => {
            console.error(error);
            container.innerHTML = `
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar ${templateName}: ${error.message}</p>
                    <button onclick="location.reload()">Reintentar</button>
                </div>
            `;
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
        "crear_usuarios.html": "/static/javascript/menu_principal/subs_menus/crear_usuarios.js",
        "roles_usuarios.html": "/static/javascript/menu_principal/subs_menus/roles_usuarios.js"
    };

    if (templateScripts[templateName]) {
        const scriptUrl = templateScripts[templateName];
        const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
        
        if (!existingScript) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = scriptUrl;
                
                // Primero verificar si el archivo existe
                fetch(scriptUrl, { method: 'HEAD' })
                    .then(response => {
                        if (response.ok) {
                            // Si existe, cargar el script
                            script.onload = () => {
                                setTimeout(() => {
                                    initializeTemplateFunctions(templateName);
                                    resolve();
                                }, 300);
                            };
                            script.onerror = () => {
                                console.error(`Error al cargar el script: ${scriptUrl}`);
                                reject(`Script no encontrado: ${scriptUrl}`);
                            };
                            document.head.appendChild(script);
                        } else {
                            console.warn(`El script ${scriptUrl} no existe en el servidor`);
                            reject(`Script no encontrado: ${scriptUrl}`);
                        }
                    })
                    .catch(error => {
                        console.error(`Error verificando script ${scriptUrl}:`, error);
                        reject(`Error verificando script: ${scriptUrl}`);
                    });
            }).catch(error => {
                console.warn(error);
                // Continuar aunque falle la carga del script
                return Promise.resolve();
            });
        } else {
            // Si el script ya está cargado
            setTimeout(() => initializeTemplateFunctions(templateName), 100);
            return Promise.resolve();
        }
    }
    return Promise.resolve();
}

// Función auxiliar para inicializar funciones específicas de cada template
function initializeTemplateFunctions(templateName) {
    try {
        if (templateName === "importar_nomina.html") {
            if (window.initializeImportarNomina) initializeImportarNomina();
            if (window.aplicarFiltros) aplicarFiltros();
        }
        if (templateName === "crear_usuarios.html") {
            if (window.inicializarEventosEmpleados) inicializarEventosEmpleados();
            if (window.aplicarFiltrosEmpleados) aplicarFiltrosEmpleados();
        }
        if (templateName === "roles_usuarios.html") {
            if (window.inicializarEventosRoles) inicializarEventosRoles();
        }
    } catch (error) {
        console.error(`Error inicializando funciones para ${templateName}:`, error);
    }
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
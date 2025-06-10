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
        "roles_usuarios.html": "/roles_usuarios",
        "crear_roles.html" : "/crear_roles",

        "gestion_respaldo.html": "/gestion_respaldo"
    };

    const url = templateUrls[templateName];
    if (!url) return;

    const container = document.getElementById('contenido-dinamico');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Cargando contenido...</div>';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Error ${response.status} al cargar ${templateName}`);
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            
            // Esperar a que el navegador procese el HTML antes de continuar
            return new Promise(resolve => setTimeout(resolve, 50));
        })
        .then(() => loadTemplateScripts(templateName))
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
        "roles_usuarios.html": "/static/javascript/menu_principal/subs_menus/roles_usuarios.js",
        "crear_roles.html": "/static/javascript/menu_principal/subs_menus/crear_roles.js",
        "gestion_respaldo.html": "/static/javascript/menu_principal/subs_menus/gestion_respaldo.js",
        "ver_prenomina.html": "/static/javascript/menu_principal/subs_menus/ver_prenomina.js"
    };



    if (templateScripts[templateName]) {
        const scriptUrl = templateScripts[templateName];
        console.log(`Intentando cargar script: ${scriptUrl}`); // Debug
        
        return new Promise((resolve, reject) => {
            // Verificar primero si el archivo existe
            fetch(scriptUrl, { method: 'HEAD' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Archivo no encontrado (${response.status})`);
                    }
                    
                    const script = document.createElement('script');
                    script.src = scriptUrl;
                    
                    script.onload = () => {
                        console.log(`Script cargado, funciones disponibles:`, {
                            inicializarModuloUsuarios: window.inicializarModuloUsuarios,
                            abrirModalEditarUsuario: window.abrirModalEditarUsuario,
                            eliminarUsuario: window.eliminarUsuario
                        });
                        
                        // Esperar un poco más para asegurar que todo está listo
                        setTimeout(() => {
                            initializeTemplateFunctions(templateName);
                            resolve();
                        }, 300);
                    };
                    
                    script.onerror = () => {
                        console.error(`Error al cargar el script: ${scriptUrl}`);
                        reject(new Error(`Error loading ${scriptUrl}`));
                    };
                    
                    document.head.appendChild(script);
                })
                .catch(error => {
                    console.error(`Error verificando script ${scriptUrl}:`, error);
                    reject(error);
                });
        }).catch(error => {
            console.warn(error);
            // Continuar aunque falle la carga del script
            return Promise.resolve();
        });
    }
    return Promise.resolve();
}

// Función auxiliar para inicializar funciones específicas de cada template
function initializeTemplateFunctions(templateName) {
    console.log(`Inicializando funciones para ${templateName}`);
    
    try {
        if (templateName === "importar_nomina.html") {
            if (window.initializeImportarNomina) {
                console.log("Ejecutando initializeImportarNomina");
                initializeImportarNomina();
            }
            if (window.aplicarFiltros) {
                console.log("Ejecutando aplicarFiltros");
                aplicarFiltros();
            }
        }
        if (templateName === "crear_usuarios.html") {
            if (window.inicializarEventosEmpleados) {
                console.log("Ejecutando inicializarEventosEmpleados");
                inicializarEventosEmpleados();
            }
            if (window.aplicarFiltrosEmpleados) {
                console.log("Ejecutando aplicarFiltrosEmpleados");
                aplicarFiltrosEmpleados();
            }
        }
        if (templateName === "roles_usuarios.html") {
            // Implementación mejorada con límite de reintentos
            let intentos = 0;
            const maxIntentos = 5;
            
            const checkAndInitialize = () => {
                intentos++;
                
                if (window.inicializarModuloUsuarios) {
                    console.log(`Ejecutando inicializarModuloUsuarios (intento ${intentos})`);
                    try {
                        inicializarModuloUsuarios();
                        return; // Salir si tuvo éxito
                    } catch (e) {
                        console.error("Error ejecutando inicializarModuloUsuarios:", e);
                    }
                }
                
                if (intentos >= maxIntentos) {
                    console.error(`No se pudo cargar inicializarModuloUsuarios después de ${maxIntentos} intentos`);
                    return;
                }
                
                console.warn(`inicializarModuloUsuarios no disponible (intento ${intentos}), reintentando...`);
                setTimeout(checkAndInitialize, 300 * intentos); // Aumenta el tiempo de espera cada intento
            };
            
            // Iniciar el proceso con un tiempo de espera inicial
            setTimeout(checkAndInitialize, 100);
        }
        if (templateName === "crear_roles.html") {
            if (window.inicializarModuloRoles) {
                console.log("Ejecutando inicializarModuloRoles");
                inicializarModuloRoles();
            }
        }
        if (templateName === "ver_prenomina.html") {
            if (window.initializeVerPrenomina) {
                console.log("Ejecutando initializeVerPrenomina");
                initializeVerPrenomina();
            }
        }
    } catch (error) {
        console.error(`Error inicializando funciones para ${templateName}:`, error);
    }
}


// Funciones para cargar Chart.js y Dashboard.js
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

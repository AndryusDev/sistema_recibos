let currentTemplate = null;



// Función mejorada para cargar scripts
function loadScript(url) {
    return new Promise((resolve, reject) => {
        // Verificar si el script ya está cargado
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            // Si ya está cargado, verificar si necesita inicialización
            const moduleName = getModuleNameFromScript(url);
            if (window[moduleName] && typeof window[moduleName].init === 'function') {
                window[moduleName].init();
            }
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = url;
        
        script.onload = function() {
            // Inicializar el módulo después de cargar
            const moduleName = getModuleNameFromScript(url);
            if (window[moduleName] && typeof window[moduleName].init === 'function') {
                window[moduleName].init();
            }
            resolve();
        };
        
        script.onerror = () => reject(new Error(`Error cargando script: ${url}`));
        document.body.appendChild(script);
    });
}

function getModuleNameFromScript(scriptUrl) {
    const matches = scriptUrl.match(/\/([^\/]+)\.js$/);
    if (!matches) return null;
    
    // Convertir a formato PascalCase (ej: importar_nomina.js -> ImportarNomina)
    return matches[1]
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('[data-template]');
    const mainContentDiv = document.querySelector('.rightweb-section');
    
    const templatesConfig = {
        initial: 'dashboard.html',
        scripts: {
            'noticias.html': ['/static/javascript/menu_principal/subs_menus/noticias.js'],
            'perfil_usuario.html': ['/static/javascript/menu_principal/subs_menus/perfil_usuario.js'],
            'recibos_pagos.html': ['/static/javascript/menu_principal/subs_menus/recibos_pagos.js'],
            'constancia_trabajo.html': ['/static/javascript/menu_principal/subs_menus/constancia_trabajo.js'],
            'arc.html': ['/static/javascript/menu_principal/subs_menus/arc.js'],
            'importar_nomina.html': ['/static/javascript/menu_principal/subs_menus/importar_nomina.js'],
            'ver_prenomina.html': ['/static/javascript/menu_principal/subs_menus/ver_prenomina.js'],
            'crear_usuarios.html': ['/static/javascript/menu_principal/subs_menus/crear_usuarios.js'],
            'gestion_respaldo.html': ['/static/javascript/menu_principal/subs_menus/gestion_respaldo.js'],
            'dashboard.html': ['/static/javascript/menu_principal/subs_menus/dashboard.js'],
            'roles_usuarios': ['/static/javascript/menu_principal/subs_menus/roles_usuarios.js'],
            'crear_roles.html': ['/static/javascript/menu_principal/subs_menus/crear_roles.js'],
            'vacaciones.html': ['/static/javascript/menu_principal/subs_menus/vacaciones.js']
        }
    };
    
    // Función loadTemplate ACTUALIZADA
    // En tu sidebar.js, reemplaza la función loadTemplate con esta versión mejorada:
async function loadTemplate(templateName) {
    if (!templateName || templateName === 'null') {
        console.error('Plantilla nula');
        return false;
    }

    try {
        // 1. Limpiar plantilla anterior (como ya lo hace)
        if (currentTemplate) {
            const event = new CustomEvent('templateUnloading', {
                detail: { template: currentTemplate }
            });
            document.dispatchEvent(event);
        }

        // 2. Mapeo de templates a URLs (como en tu primer enfoque)
        let url = "";
        switch(templateName) {
            case "importar_nomina.html": url = "/importar_nomina/"; break;
            case "perfil_usuario.html": url = "/perfil_usuario"; break;
            case "recibos_pagos.html": url = "/recibos_pagos"; break;
            case "constancia_trabajo.html": url = "/constancia_trabajo/"; break;
            case "arc.html": url = "/arc/"; break;
            case "noticias.html": url = "/noticias/"; break;
            case "ver_prenomina.html": url = "/ver_prenomina"; break;
            case "crear_usuarios.html": url = "/crear_usuarios"; break;
            case "roles_usuarios.html": url = "/roles_usuarios"; break;
            case "crear_roles.html": url = "/crear_roles"; break;
            case "gestion_respaldo.html": url = "/gestion_respaldo"; break;
            case "vacaciones.html": url = "/vacaciones"; break;
            case "dashboard.html": 
                url = "/dashboard";
                // Manejo especial para dashboard como en tu primer enfoque
                await loadDashboardContent();
                return true;
            default: 
                console.error(`Template no mapeado: ${templateName}`);
                return false;
        }

        // 3. Cargar contenido desde la URL de Django
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        mainContentDiv.innerHTML = await response.text();
        currentTemplate = templateName;
        
        // 4. Cargar scripts asociados (como ya lo hace)
        if (templatesConfig.scripts[templateName]) {
            await Promise.all(
                templatesConfig.scripts[templateName].map(scriptUrl => 
                    loadScript(scriptUrl).catch(e => {
                        console.error(`Error cargando script ${scriptUrl}:`, e);
                        return null;
                    })
                )
            );
        }
        
        return true;
    } catch (error) {
        console.error(`Error cargando plantilla ${templateName}:`, error);
        mainContentDiv.innerHTML = `
            <div class="error-message">
                <h3>Error al cargar la página</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()">Recargar</button>
            </div>
        `;
        return false;
    }
}

// Mantén tu función loadDashboardContent similar al primer enfoque
async function loadDashboardContent() {
    try {
        const response = await fetch('/dashboard');
        const html = await response.text();
        mainContentDiv.innerHTML = html;
        
        await loadChartJs();
        await loadDashboardJs();
        
        if (window.initializeDashboard) {
            window.initializeDashboard();
        }
    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }
}

    // Cargar plantilla inicial
    if (mainContentDiv) {
        loadTemplate(templatesConfig.initial).then(success => {
            if (!success) {
                console.error('No se pudo cargar la plantilla inicial');
                // Plantilla de fallback
                mainContentDiv.innerHTML = `
                    <div class="error-message">
                        <h2>Error al cargar la página inicial</h2>
                        <p>Por favor, intente recargar la página o contacte al administrador.</p>
                    </div>
                `;
            }
        });
    } else {
        console.error('El elemento .rightweb-section no se encontró en el DOM.');
    }

    // Manejadores de eventos para los enlaces del menú
    menuLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const template = this.getAttribute('data-template');
            loadTemplate(template);
        });
    });

    // Manejo del sidebar (mismo código que tenías)
    const menusItems = document.querySelectorAll(".menu-item");
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menu-btn");

    // Minimizar sidebar
    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("minimize");
            void sidebar.offsetWidth;
        });
    }

    menusItems.forEach((menuItem) => {
        const menuLink = menuItem.querySelector(".menu-link");
        const subMenu = menuItem.querySelector(".sub-menu");
        const isDropdown = menuItem.classList.contains("menu-item-dropdown");

        if (menuLink) {
            menuLink.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
        
                // Cerrar otros
                document.querySelectorAll('.menu-item.selected').forEach(item => {
                    if(item !== menuItem) {
                        item.classList.remove('selected', 'sub-menu-toggle');
                        item.querySelector('.sub-menu')?.classList.remove('open');
                    }
                });

                // Activar el menú actual y marcarlo como seleccionado
                menuItem.classList.toggle('selected');
        
                if(isDropdown && subMenu) {
                    menuItem.classList.toggle('sub-menu-toggle');
                    subMenu.classList.toggle('open');
                }
            });
        }

        // Manejo de submenús
        if (subMenu) {
            subMenu.querySelectorAll(".sub-menu-link").forEach(subMenuItem => {
                subMenuItem.addEventListener("click", (event) => {
                    event.stopPropagation();
                    document.querySelectorAll('.sub-menu-link.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    subMenuItem.classList.add('selected');
                });
            });
        }
    });

    // Función de seguridad (mismo código que tenías)
    function SecurityLvl(JsonOpcLvl) {
        const securityString = JsonOpcLvl;
        const options = document.querySelectorAll(".sidebar .OpcMenu");

        options.forEach((option, index) => {
            if (securityString[index] === "0") {
                option.classList.add("hidden");
            } else {
                option.classList.remove("hidden");
            }
        });
    }

    // Si necesitas usar SecurityLvl desde otro lugar, exponela al ámbito global
    window.SecurityLvl = SecurityLvl;
});

document.addEventListener('DOMContentLoaded', function() {
    // Obtener información guardada
    const usuarioInfo = JSON.parse(sessionStorage.getItem('usuario_info'));
    
    /*if (usuarioInfo) {
        // Actualizar elementos del DOM
        document.getElementById('user-name').textContent = usuarioInfo.nombre;
        document.getElementById('user-lastname').textContent = usuarioInfo.apellido;
        
        // Mostrar roles (si existen)
        if (usuarioInfo.roles && usuarioInfo.roles.length > 0) {
            document.getElementById('roles').textContent = usuarioInfo.roles.join(', ');
        }
        
        // Actualizar foto de perfil
        const userImg = document.querySelector('.user-img img');
        if (userImg) {
            userImg.src = usuarioInfo.foto_perfil;
            userImg.alt = `Foto de ${usuarioInfo.nombre} ${usuarioInfo.apellido}`;
        }
        
        // Opcional: Mostrar más información donde sea necesario
        console.log('Usuario cargado:', usuarioInfo);
    } else {
        console.warn('No se encontró información de usuario en sessionStorage');
    }*/
});
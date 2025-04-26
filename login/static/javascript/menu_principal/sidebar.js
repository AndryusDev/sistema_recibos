// wdp/static/jvs/sidebar.js

let currentTemplate = null;

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Error cargando script: ${url}`));
        document.body.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('[data-template]');
    const mainContentDiv = document.querySelector('.rightweb-section');
    
    const templatesConfig = {
        initial: 'noticias.html',
        scripts: {
            'noticias.html': ['/static/javascript/menu_principal/subs_menus/noticias.js'],
            'perfil_usuario.html': ['/static/javascript/menu_principal/subs_menus/perfil_usuario.js'],
            'recibo_pago.html': ['/static/javascript/menu_principal/subs_menus/recibo_pago.js']
        }
    };
    
    // Función loadTemplate ACTUALIZADA
    async function loadTemplate(templateName) {
        // Validación adicional
        if (!templateName || templateName === 'null') {
            console.error('Se intentó cargar una plantilla nula');
            return false;
        }
    
        try {
            // Limpiar plantilla anterior
            if (currentTemplate) {
                const event = new CustomEvent('templateUnloading', {
                    detail: { template: currentTemplate }
                });
                document.dispatchEvent(event);
            }
    
            // Cargar nueva plantilla - URL ACTUALIZADA
            const response = await fetch(`/load_template/${templateName}/`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            mainContentDiv.innerHTML = await response.text();
            currentTemplate = templateName;
            
            // Cargar scripts - MANEJO DE ERRORES MEJORADO
            if (templatesConfig.scripts[templateName]) {
                try {
                    await Promise.all(
                        templatesConfig.scripts[templateName].map(scriptUrl => 
                            loadScript(scriptUrl).catch(e => {
                                console.error(`Error cargando script ${scriptUrl}:`, e);
                                return null; // Continuar aunque falle un script
                            })
                        )
                    );
                } catch (e) {
                    console.error('Error cargando scripts:', e);
                }
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
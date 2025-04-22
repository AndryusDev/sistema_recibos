// wdp/static/jvs/sidebar.js

document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('.sub-menu-link');
    const mainContentDiv = document.querySelector('.rightweb-section');
    const initialTemplate = 'plantlaboral.tpl'; // Ajusta si es diferente
    let currentTemplate = null; // Variable para rastrear la plantilla actual

    // Define la configuración de scripts directamente aquí
    const templateScripts = {
        'personas.tpl': ['/jvs/personas.js?v=1.0'],
        'plantlaboral.tpl': ['/jvs/plantlaboral.js?v=1.0'],
        // Agrega aquí más plantillas y sus scripts asociados
    };

    // Función para cargar un script dinámicamente
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            script.onload = resolve;
            script.onerror = reject;
            mainContentDiv.appendChild(script);
        });
    }

    // Cargar la plantilla inicial al cargar la página
    if (mainContentDiv) {
        fetch(`/load_template?template=${initialTemplate}`)
            .then(response => {
                if (!response.ok) {
                    console.error('Error al cargar la plantilla inicial:', response.status);
                    return;
                }
                return response.text();
            })
            .then(html => {
                mainContentDiv.innerHTML = html;
                currentTemplate = initialTemplate; // Establecer la plantilla inicial como actual
                if (templateScripts[initialTemplate]) {
                    templateScripts[initialTemplate].forEach(scriptUrl => {
                        loadScript(scriptUrl);
                    });
                }
            })
            .catch(error => {
                console.error('Error al cargar la plantilla inicial:', error);
            });
    } else {
        console.error('El elemento .rightweb-section no se encontró en el DOM.');
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const template = this.getAttribute('data-template');

            // Disparar evento para que el script del template actual se limpie
            if (currentTemplate) {
                const unloadingEvent = new CustomEvent('templateUnloading', { detail: { template: currentTemplate } });
                mainContentDiv.dispatchEvent(unloadingEvent);
            }

            fetch(`/load_template?template=${template}`)
                .then(response => {
                    if (!response.ok) {
                        console.error('Error al cargar la plantilla:', response.status);
                        return;
                    }
                    return response.text();
                })
                .then(html => {
                    mainContentDiv.innerHTML = html;
                    currentTemplate = template; // Actualizar la plantilla actual
                    if (templateScripts[template]) {
                        templateScripts[template].forEach(scriptUrl => {
                            loadScript(scriptUrl);
                        });
                    } else {
                        console.warn(`No se encontraron scripts definidos para la plantilla: ${template}`);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    });

    // ... (El resto de tu código en sidebar.js)
});

window.onload = function() {
    const menusItems = document.querySelectorAll(".menu-item");
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menu-btn");

    // Minimizar sidebar
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("minimize");

        void sidebar.offsetWidth;
    });

    menusItems.forEach((menuItem) => {
        const menuLink = menuItem.querySelector(".menu-link");
        const subMenu = menuItem.querySelector(".sub-menu");
        const isDropdown = menuItem.classList.contains("menu-item-dropdown");

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
    
            if(isDropdown) {
                menuItem.classList.toggle('sub-menu-toggle');
                subMenu?.classList.toggle('open');
            }
        });

        // Aquí es donde debes agregar el evento para los elementos del submenú
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
};
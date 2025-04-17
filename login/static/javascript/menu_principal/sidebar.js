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

    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("minimize");
    });

    menusItems.forEach((menuItem) => {
        const menuLink = menuItem.querySelector(".menu-link");
        const subMenu = menuItem.querySelector(".sub-menu");

        menuLink.addEventListener("click", (event) => {
            event.stopPropagation();

            const isDropdown = menuItem.classList.contains("menu-item-dropdown");

            // Cerrar otros submenús y deseleccionar otros elementos
            menusItems.forEach((item) => {
                const otherSubmenu = item.querySelector(".sub-menu");
                if (item !== menuItem) {
                    item.classList.remove("sub-menu-toggle");
                    item.classList.remove("selected");
                    if (otherSubmenu) {
                        otherSubmenu.style.height = "0";
                        otherSubmenu.style.padding = "0";
                    }
                    const otherMenuLink = item.querySelector(".menu-link");
                    if (otherMenuLink) {
                        otherMenuLink.classList.remove("selected");
                    }
                }
            });

            // Activar el menú actual y marcarlo como seleccionado
            menuItem.classList.add("selected");
            menuLink.classList.add("selected");

            // Si es un menú desplegable, manejar el submenú
            if (isDropdown) {
                const isActive = menuItem.classList.contains("sub-menu-toggle");
                if (!isActive) {
                    menuItem.classList.add("sub-menu-toggle");
                    if (subMenu) {
                        subMenu.style.height = `${subMenu.scrollHeight + 6}px`;
                        subMenu.style.padding = "0.2rem 0";
                    }
                }
            }
        });

        // Aquí es donde debes agregar el evento para los elementos del submenú
        if (subMenu) {
            const subMenuItems = subMenu.querySelectorAll(".sub-menu-link");
            subMenuItems.forEach((subMenuItem) => {
                subMenuItem.addEventListener("click", (event) => {
                    event.stopPropagation();
                    
                    // Desmarcar todos los elementos de todos los submenús
                    const allSubMenuLinks = document.querySelectorAll(".sub-menu-link");
                    allSubMenuLinks.forEach((item) => {
                        item.classList.remove("selected");
                    });
                    
                    // Marcar el elemento del submenú como seleccionado
                    subMenuItem.classList.add("selected");

                    // Eliminar la clase 'selected' de todos los menu-link
                    menusItems.forEach((item) => {
                        const otherMenuLink = item.querySelector(".menu-link");
                        if (otherMenuLink) {
                            otherMenuLink.classList.remove("selected");
                        }
                    });

                    // Agregar la clase 'selected' al menu-link del menu-item-dropdown correspondiente
                    menuLink.classList.add("selected");
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
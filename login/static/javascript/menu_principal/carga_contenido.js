document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.OpcMenu').forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            const template = this.getAttribute('data-template');
            let url = "";

            // Mapea templates a URLs Django
            if (template === "importar_nomina.html") {
                url = "/importar_nomina";
            } else if (template === "perfil_usuario.html") {
                url = "/perfil_usuario";
            } else if (template === "recibos_pagos.html") {
                url = "/recibos_pagos";
            } else if (template === "constancia_trabajo.html") {
                url = "/constancia_trabajo/";
            } else if (template === "arc.html") {
                url = "/arc/";
            } else if (template === "gestion_nomina.html") {
                url = "/gestion_nomina/";
            } else if (template === "noticias.html") {
                url = "/noticias/";
            } else if (template === "ver_prenomina.html") {
                url = "/ver_prenomina";
            } else if (template === "crear_usuarios.html") {
                url = "/crear_usuarios";
            }

            if (url !== "") {
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Error al cargar el contenido");
                        }
                        return response.text();
                    })
                    .then(html => {
                        document.getElementById('contenido-dinamico').innerHTML = html;
                    })
                    .catch(error => {
                        console.error(error);
                        document.getElementById('contenido-dinamico').innerHTML = "<p>Error al cargar contenido.</p>";
                    });
            }
        });
    });
});

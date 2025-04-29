document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');

    if (!form) {
        console.error("❌ Formulario 'loginForm' no encontrado.");
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);

        fetch("/login_empleado/", {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);

                // 1. Guardar la información del usuario
                sessionStorage.setItem('usuario_info', JSON.stringify(data.usuario_info));

                // 2. Redirigir a la página del menú
                setTimeout(() => {
                    window.location.href = data.redirect_url; // ejemplo: '/menu/'
                }, 500); // medio segundo de espera para que el usuario vea el mensaje
            } else {
                console.error("❌ Error en login:", data.message);
                alert('⚠ Falló el inicio de sesión. Revisa tus credenciales.');
            }
        })
        .catch(error => {
            console.error('⚠ Error en la solicitud:', error);
            alert('⚠ Error del servidor. Intenta más tarde.');
        });
    });
});


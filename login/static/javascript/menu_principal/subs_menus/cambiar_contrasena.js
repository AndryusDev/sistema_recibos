(function() {

// JavaScript for cambiar_contrasena.html modal verification

    const form = document.getElementById('form-cambiar-contrasena');
    const modal = document.getElementById('modal-verificacion');

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    async function cambiarContrasena() {
        // Read usuario_id from hidden input field
        const usuarioInput = document.getElementById('usuario-id');
        let usuario_id = usuarioInput ? usuarioInput.value : '';
        console.log('usuario_id at start of cambiarContrasena:', usuario_id);
        if (!usuario_id || usuario_id === 'NO_ID') {
            alert('Error: usuario_id no está definido. Por favor, inicie sesión nuevamente.');
            return;
        }
        console.log('usuario_id used in cambiar_contrasena:', usuario_id);

        const currentPassword = document.getElementById('contrasena-actual').value.trim();
        const newPassword = document.getElementById('nueva-contrasena').value.trim();
        const confirmPassword = document.getElementById('confirmar-contrasena').value.trim();

        if (currentPassword === '' || newPassword === '' || confirmPassword === '') {
            alert('Por favor, complete todos los campos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Las nuevas contraseñas no coinciden.');
            return;
        }

        try {
            const requestBody = {
                contrasena_actual: currentPassword,
                nueva_contrasena: newPassword,
                confirmar_contrasena: confirmPassword,
                usuario_id: usuario_id
            };
            console.log('Request body for cambiar_contrasena:', requestBody);

            const response = await fetch('/api/cambiar_contrasena/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                credentials: 'same-origin',
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log('Response from api_cambiar_contrasena:', data);

            if (data.success) {
                alert('Contraseña cambiada correctamente.');
                if (modal) {
                    modal.style.display = 'none';
                }
                if (form) {
                    form.reset();
                }
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Error al conectar con el servidor.');
            console.error('Error:', error);
        }
    }

    function initCambiarContrasena() {
        if (!form) return;

        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        submitButton.type = 'button';

        submitButton.addEventListener('click', function() {
            cambiarContrasena();
        });
    }

    if (typeof window !== 'undefined') {
        window.initCambiarContrasena = initCambiarContrasena;
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('form-cambiar-contrasena')) {
            initCambiarContrasena();
        }
    });

})();
